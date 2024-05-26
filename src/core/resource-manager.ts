import { CoreTypes } from "./core.type";

// Define event types and payloads
export namespace EventTypes {
    export interface ResourceLoadEventDetail<T extends string> {
        totalResources: number;
        resourcesLoaded: number;
        resource: CoreTypes.TResource<T>;
    }

    export interface ResourcesLoadedEventDetail {
        totalResources: number;
        resourcesLoaded: number;
    }

    export type ResourceManagerEventMap<T extends string> = {
        onResourceLoad: CustomEvent<ResourceLoadEventDetail<T>>;
        onResourcesLoaded: CustomEvent<ResourcesLoadedEventDetail>;
    };

    // Event handler types
    export type OnResourceLoadEventHandler<T extends string> = (event: CustomEvent<ResourceLoadEventDetail<T>>) => void;
    export type OnResourcesLoadedEventHandler = (event: CustomEvent<ResourcesLoadedEventDetail>) => void;
}

// Create a strongly typed EventTarget
export class ResourceManagerEventTarget<T extends string> extends EventTarget {

    public constructor() {
        super();
    }

    addEventListener<K extends keyof EventTypes.ResourceManagerEventMap<T>>(type: K, listener: (this: ResourceManagerEventTarget<T>, ev: EventTypes.ResourceManagerEventMap<T>[K]) => any): void {
        super.addEventListener(type, listener as EventListener);
    }

    removeEventListener<K extends keyof EventTypes.ResourceManagerEventMap<T>>(type: K, listener: (this: ResourceManagerEventTarget<T>, ev: EventTypes.ResourceManagerEventMap<T>[K]) => any): void {
        super.removeEventListener(type, listener as EventListener);
    }

    dispatchEvent(event: Event): boolean {
        return super.dispatchEvent(event);
    }

    dispatchCustomEvent<K extends keyof EventTypes.ResourceManagerEventMap<T>>(type: K, detail: EventTypes.ResourceManagerEventMap<T>[K]["detail"]): boolean {
        const event = new CustomEvent(type, { detail }) as EventTypes.ResourceManagerEventMap<T>[K];
        return this.dispatchEvent(event);
    }
}

// ResourceManager class
export class ResourceManager<T extends string> /*extends ResourceManagerEventTarget<T>*/ {
    private resources: CoreTypes.TResources<T> = {};

    constructor() {
        //super();
    }

    async load(resources: CoreTypes.TResource<T>[]): Promise<void> {
        console.log('Loading resources.', resources);
        let resourcesLoaded = 0;

        const loadResource = async (resource: CoreTypes.TResource<T>): Promise<void> => {
            console.log(`Loading resource: "${resource.name}"`, resource);
            try {
                if (resource.type === 'Gfx') {
                    const img = await this.loadGfxResource(resource);
                    this.resources[resource.name] = img;
                } else if (resource.type === 'Sfx') {
                    const audio = await this.loadSfxResource(resource);
                    this.resources[resource.name] = audio;
                }
                resourcesLoaded++;
                console.log(`${resourcesLoaded}/${resources.length} resources loaded.`);

                /*this.dispatchCustomEvent('onResourceLoad', {
                    totalResources: resources.length,
                    resourcesLoaded: resourcesLoaded,
                    resource: resource
                });*/
            } catch (error) {
                throw new Error(`Failed to load resource: ${resource.name}, ${error.message}`);
            }
        };

        try {
            await Promise.all(resources.map(loadResource));
            /*this.dispatchCustomEvent('onResourcesLoaded', {
                totalResources: resources.length,
                resourcesLoaded: resourcesLoaded
            });*/
        } catch (error) {
            throw new Error(`Failed to load resources: ${error.message}`);
        }
    }

    private async loadGfxResource(resource: CoreTypes.TResource<T>): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const handleError = () => {
                const exception = new Error(`Failed to load image resource: ${resource.src}`);
                reject(exception);
            };

            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = handleError;
            img.src = resource.src;
        });
    }

    private async loadSfxResource(resource: CoreTypes.TResource<T>): Promise<HTMLAudioElement> {
        return new Promise((resolve, reject) => {
            const handleError = () => {
                const exception = new Error(`Failed to load audio resource: ${resource.src}`);
                reject(exception);
            };

            const audio = new Audio();
            audio.onloadeddata = () => resolve(audio);
            audio.onerror = handleError;
            audio.src = resource.src;
        });
    }

    get<TResult extends CoreTypes.TResourceType>(name: T): TResult {
        return this.resources[name] as TResult;
    }
}