import { BaseComponent } from "./base-component";
import { GameApp } from "../game-app";
import { CoreTypes } from "../core.type";

export class ResourceComponent<TResourceID extends string> extends BaseComponent<TResourceID> {
    private resources: { [key: string]: CoreTypes.TResourceType } = {};

    constructor(private app: GameApp<TResourceID>) {
        super();
    }

    addResource(name: TResourceID, resource: CoreTypes.TResourceType): void {
        this.resources[name] = resource;
    }

    getResource<R extends CoreTypes.TResourceType>(name: TResourceID): R {
        return this.resources[name] as R;
    }

    removeResource(name: TResourceID): void {
        delete this.resources[name];
    }

    update(): void {

    }

    draw(): void {

    }

    destroy(): void {
        this.resources = {};
    }
}
