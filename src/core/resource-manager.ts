import { CoreTypes } from "./core.type";
import { Logger } from "./logger";

const logger = new Logger('ResourceManager');

export class ResourceManager<T extends string> {
    private resources: CoreTypes.TResources<T> = {};

    async load(resources: CoreTypes.TResource<T>[], onProgress?: (loaded: number, total: number) => void): Promise<void> {
        logger.log('Loading resources.', resources);
        let resourcesLoaded = 0;

        const loadResource = async (resource: CoreTypes.TResource<T>): Promise<void> => {
            logger.log(`Loading resource: "${resource.name}"`, resource);
            try {
                if (resource.type === 'gfx') {
                    const img = await this.loadGfxResource(resource);
                    this.resources[resource.name] = img;
                } else if (resource.type === 'sfx') {
                    const audio = await this.loadSfxResource(resource);
                    this.resources[resource.name] = audio;
                } else if (resource.type === 'midi') {
                    const midi = await this.loadMidiResource(resource);
                    this.resources[resource.name] = midi;
                }
                resourcesLoaded++;
                logger.log(`${resourcesLoaded}/${resources.length} resources loaded.`);

                if (onProgress) {
                    onProgress(resourcesLoaded, resources.length);
                }
            } catch (error) {
                throw new Error(`Failed to load resource: ${resource.name}: ${error}`);
            }
        };

        try {
            await Promise.all(resources.map(loadResource));
        } catch (error) {
            throw new Error(`Failed to load resources: ${error}`);
        }
    }

    private async loadGfxResource(resource: CoreTypes.TResource<T>): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                const exception = new Error(`Failed to load GFX resource: ${resource.url}`);
                reject(exception);
            }
            img.src = resource.url;
        });
    }

    private async loadMidiResource(resource: CoreTypes.TResource<T>): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            fetch(resource.url)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => {
                    logger.log(`Loaded MIDI resource: ${resource.name}, size: ${arrayBuffer.byteLength}`);
                    resolve(arrayBuffer);
                })
                .catch(error => {
                    const exception = new Error(`Failed to load MIDI resource: ${resource.url}, ${error.message}`);
                    reject(exception);
                });
        });
    }
    
    private async loadSfxResource(resource: CoreTypes.TResource<T>): Promise<HTMLAudioElement> {
        return new Promise((resolve, reject) => {
            const handleError = () => {
                const exception = new Error(`Failed to load audio resource: ${resource.url}`);
                reject(exception);
            };

            const audio = new Audio();
            audio.onloadeddata = () => resolve(audio);
            audio.onerror = handleError;
            audio.src = resource.url;
        });
    }

    get<TResult extends CoreTypes.TResourceType>(name: T): TResult {
        return this.resources[name] as TResult;
    }
}