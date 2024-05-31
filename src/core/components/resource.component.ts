import { BaseComponent } from "./base-component";
import { GameApp } from "../game-app";
import { CoreTypes } from "../core.type";

export class ResourceComponent
    <TResourceID extends string, TGameObjectID extends string>
    extends BaseComponent<TResourceID, TGameObjectID> {

    constructor(private app: GameApp<TResourceID, TGameObjectID>) {
        super();
    }

    private resources: { [key: string]: CoreTypes.TResourceType } = {};

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
