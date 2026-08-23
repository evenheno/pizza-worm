import { CoreTypes } from "./core.type";
import { Logger } from "./logger";

const logger = new Logger('ResourceManager');

export class ResourceManager<T extends string> {
    private resources: CoreTypes.TResources<T> = {};

    async load(resources: CoreTypes.TResource<T>[], onProgress?: (progress: CoreTypes.TResourceLoadProgress<T>) => void): Promise<void> {
        logger.log('Loading resources.', resources);
        let resourcesLoaded = 0;
        const total = resources.length;
        const preflight = await this.preflightResources(resources);
        let bytesLoaded = 0;

        if (onProgress) {
            onProgress({
                loaded: 0,
                total,
                percentage: 0,
                bytesLoaded: 0,
                bytesTotal: preflight.totalBytes,
            });
        }

        const loadResource = async (resource: CoreTypes.TResource<T>): Promise<void> => {
            logger.log(`Loading resource: "${resource.name}"`, resource);
            try {
                const resourceBytesTotal = preflight.resourceBytes[resource.name] || 0;
                let resourceBytesLoaded = 0;

                const binary = await this.fetchResourceBinary(resource.url, (loadedChunkBytes) => {
                    resourceBytesLoaded += loadedChunkBytes;
                    bytesLoaded += loadedChunkBytes;
                    if (onProgress) {
                        const percentage = preflight.totalBytes > 0
                            ? Math.round((bytesLoaded / preflight.totalBytes) * 100)
                            : Math.round((resourcesLoaded / total) * 100);
                        onProgress({
                            loaded: resourcesLoaded,
                            total,
                            percentage,
                            resource: resource.name,
                            bytesLoaded,
                            bytesTotal: preflight.totalBytes,
                            resourceBytesLoaded,
                            resourceBytesTotal,
                        });
                    }
                });

                if (resource.type === 'gfx') {
                    const img = await this.loadGfxResource(binary);
                    this.resources[resource.name] = img;
                } else if (resource.type === 'sfx') {
                    const audio = await this.loadSfxResource(binary);
                    this.resources[resource.name] = audio;
                } else if (resource.type === 'midi') {
                    const midi = binary.arrayBuffer;
                    this.resources[resource.name] = midi;
                }
                resourcesLoaded++;
                logger.log(`${resourcesLoaded}/${resources.length} resources loaded.`);

                if (onProgress) {
                    const percentage = preflight.totalBytes > 0
                        ? Math.round((bytesLoaded / preflight.totalBytes) * 100)
                        : Math.round((resourcesLoaded / total) * 100);
                    onProgress({
                        loaded: resourcesLoaded,
                        total,
                        percentage,
                        resource: resource.name,
                        bytesLoaded,
                        bytesTotal: preflight.totalBytes,
                        resourceBytesLoaded,
                        resourceBytesTotal,
                    });
                }
            } catch (error) {
                throw new Error(`Failed to load resource: ${resource.name}: ${error}`);
            }
        };

        try {
            for (let i = 0; i < resources.length; i++) {
                await loadResource(resources[i]);
            }
        } catch (error) {
            throw new Error(`Failed to load resources: ${error}`);
        }
    }

    private async loadGfxResource(binary: { arrayBuffer: ArrayBuffer; contentType?: string }): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const blob = new Blob([binary.arrayBuffer], { type: binary.contentType || 'image/*' });
            const objectUrl = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                resolve(img);
            };
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                const exception = new Error(`Failed to load GFX resource`);
                reject(exception);
            }
            img.src = objectUrl;
        });
    }
    
    private async loadSfxResource(binary: { arrayBuffer: ArrayBuffer; contentType?: string }): Promise<HTMLAudioElement> {
        return new Promise((resolve, reject) => {
            const handleError = () => {
                const exception = new Error(`Failed to load audio resource`);
                reject(exception);
            };

            const blob = new Blob([binary.arrayBuffer], { type: binary.contentType || 'audio/*' });
            const objectUrl = URL.createObjectURL(blob);
            const audio = new Audio();
            audio.onloadeddata = () => resolve(audio);
            audio.onerror = handleError;
            audio.src = objectUrl;
        });
    }

    private async preflightResources(resources: CoreTypes.TResource<T>[]): Promise<{
        resourceBytes: { [key in T]?: number };
        totalBytes: number;
    }> {
        const resourceBytes: { [key in T]?: number } = {};
        let totalBytes = 0;

        await Promise.all(resources.map(async (resource) => {
            try {
                let response = await fetch(resource.url, { method: 'HEAD' });
                if (!response.ok || !response.headers.get('content-length')) {
                    response = await fetch(resource.url, { method: 'GET' });
                    if (response.body) {
                        // We only need headers for size estimation.
                        response.body.cancel().catch(() => { });
                    }
                }

                const lengthHeader = response.headers.get('content-length');
                const resourceSize = lengthHeader ? parseInt(lengthHeader, 10) : 0;
                resourceBytes[resource.name] = isNaN(resourceSize) ? 0 : resourceSize;
            } catch {
                resourceBytes[resource.name] = 0;
            }
        }));

        for (let i = 0; i < resources.length; i++) {
            totalBytes += resourceBytes[resources[i].name] || 0;
        }

        return { resourceBytes, totalBytes };
    }

    private async fetchResourceBinary(
        url: string,
        onBytesLoaded?: (loadedChunkBytes: number) => void
    ): Promise<{ arrayBuffer: ArrayBuffer; contentType?: string }> {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const contentType = response.headers.get('content-type') || undefined;

        if (!response.body) {
            const arrayBuffer = await response.arrayBuffer();
            if (onBytesLoaded) onBytesLoaded(arrayBuffer.byteLength);
            return { arrayBuffer, contentType };
        }

        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let totalLength = 0;

        while (true) {
            const read = await reader.read();
            if (read.done) break;
            const value = read.value;
            if (!value) continue;
            chunks.push(value);
            totalLength += value.byteLength;
            if (onBytesLoaded) onBytesLoaded(value.byteLength);
        }

        const mergedBuffer = new ArrayBuffer(totalLength);
        const merged = new Uint8Array(mergedBuffer);
        let offset = 0;
        for (let i = 0; i < chunks.length; i++) {
            merged.set(chunks[i], offset);
            offset += chunks[i].byteLength;
        }

        return { arrayBuffer: mergedBuffer, contentType };
    }

    get<TResult extends CoreTypes.TResourceType>(name: T): TResult {
        if (!this.resources[name]) throw new Error(`Resource not loaded: ${name}`);
        return this.resources[name] as TResult;
    }
}
