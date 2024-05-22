export class ResourceManager {
    private resources: TResources = {};

    load(resources: TResource[], callback: () => void): void {
        let resourcesLoaded = 0;
        const totalResources = resources.length;

        const checkResourcesLoaded = (): void => {
            if (resourcesLoaded === totalResources) {
                callback();
            }
        };

        resources.forEach((resource: TResource) => {
            const img = new Image();
            img.onload = () => {
                resourcesLoaded++;
                this.resources[resource.name] = img;
                checkResourcesLoaded();
            };
            img.src = resource.src;
        });
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