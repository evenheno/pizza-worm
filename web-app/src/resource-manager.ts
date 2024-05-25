import { TResources, TResource } from "./types";

export class ResourceManager<T extends string> {
    private resources: TResources = {};

    async load(resources: TResource<T>[]) {
        console.log('Loading resources.');
        let resourcesLoaded = 0;

        const loadResource = (resource: TResource<T>): Promise<void> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    resourcesLoaded++;
                    console.log(`${resourcesLoaded}/${resources.length} resources loaded.`)
                    this.resources[resource.name] = img;
                    resolve();
                };
                img.onerror = reject;
                img.src = resource.src;
            });
        };

        await Promise.all(resources.map(loadResource));
    }


    get(name: T): HTMLImageElement {
        return this.resources[name];
    }
}

