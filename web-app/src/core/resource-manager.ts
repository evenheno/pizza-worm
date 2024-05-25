import { TResources, TResource } from "../pizza-worm/types";

export class ResourceManager<T extends string> {
    private resources: TResources = {};

    async load(resources: TResource<T>[]) {
        console.log('Loading resources.');
        let resourcesLoaded = 0;
        const loadResource = (resource: TResource<T>): Promise<void> => {
            console.log(`Loading resource: "${resource.name}"`, resource.src);
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    resourcesLoaded++;
                    console.log(`${resourcesLoaded}/${resources.length} resources loaded.`)
                    this.resources[resource.name] = img;
                    resolve();
                };
                img.onerror = (error) => {
                    reject(Error(`Failed to load image resource: ${error}`));
                }
                img.src = resource.src;
            });
        };
        try {
            await Promise.all(resources.map(loadResource));
        } catch (error) {
            throw Error(`Failed to load resources: ${error}`);
        }
    }


    get(name: T): HTMLImageElement {
        return this.resources[name];
    }
}

