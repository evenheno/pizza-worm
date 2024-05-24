export class ResourceManager {
    private resources: TResources = {};

    async load(resources: TResource[]) {
        console.log('Loading resources.');
        let resourcesLoaded = 0;

        const loadResource = (resource: TResource): Promise<void> => {
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


    getResource(name: string): HTMLImageElement {
        return this.resources[name];
    }
}

export type TResource = {
    name: string;
    src: string;
};

export type TResources = {
    [key: string]: HTMLImageElement
};