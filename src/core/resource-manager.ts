import { CoreTypes } from "./core.type";

export class ResourceManager<T extends string> {
    private resources: CoreTypes.TResources<T> = {};

    async load(resources: CoreTypes.TResource<T>[], onProgress?: (loaded: number, total: number) => void): Promise<void> {
        console.log('Loading resources.', resources);
        let resourcesLoaded = 0;

        const loadResource = async (resource: CoreTypes.TResource<T>): Promise<void> => {
            console.log(`Loading resource: "${resource.name}"`, resource);
            try {
                if (resource.type === 'gfx') {
                    const img = await this.loadGfxResource(resource);
                    this.resources[resource.name] = img;
                } else if (resource.type === 'sfx') {
                    const audio = await this.loadSfxResource(resource);
                    this.resources[resource.name] = audio;
                }
                resourcesLoaded++;
                console.log(`${resourcesLoaded}/${resources.length} resources loaded.`);

                if (onProgress) {
                    onProgress(resourcesLoaded, resources.length);
                }
            } catch (error) {
                throw new Error(`Failed to load resource: ${resource.name}, ${error.message}`);
            }
        };

        try {
            await Promise.all(resources.map(loadResource));
        } catch (error) {
            throw new Error(`Failed to load resources: ${error.message}`);
        }
    }

    private async loadGfxResource(resource: CoreTypes.TResource<T>): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => handleError();
            img.src = resource.url;

            const handleError = () => {
                const exception = new Error(`Failed to load image resource: ${resource.url}`);
                reject(exception);
            };
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