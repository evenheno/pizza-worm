import { CoreTypes } from "./core.type";
import { ResourceManager } from "./resource-manager";

export class SpriteManager<TResourceID extends string> {
    private _resourceManager: ResourceManager<TResourceID>;

    public constructor(resourceManager: ResourceManager<TResourceID>) {
        this._resourceManager = resourceManager;
    }

    public getSprite(name: TResourceID): HTMLImageElement {
        const resource = this._resourceManager.get(name);
        if (!(resource instanceof HTMLImageElement)) {
            throw new Error(`Resource is not a sprite: ${name}`);
        }
        return resource;
    }

    public getSprites(names: TResourceID[]): HTMLImageElement[] {
        const sprites: HTMLImageElement[] = [];
        for (let i = 0; i < names.length; i++) {
            sprites.push(this.getSprite(names[i]));
        }
        return sprites;
    }
}
