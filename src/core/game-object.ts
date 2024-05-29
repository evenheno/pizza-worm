import { TComponent } from "./components";
import { BaseComponent } from "./components/base-component";
import { GameApp } from "./game-app";
import { InputManager } from "./input-manager";
import { ResourceManager } from "./resource-manager";

export interface IGameObject<TResourceID extends string> {
    initialize(resource: ResourceManager<TResourceID>): void;
    update(inputManager: InputManager): void;
    draw(context: CanvasRenderingContext2D): void;
}

export abstract class GameObject<TResourceID extends string> implements IGameObject<TResourceID> {
    private _app: GameApp<TResourceID>;
    private _components: Map<TComponent, BaseComponent<TResourceID>>;
    protected get app() { return this._app }
    protected get resourceManager() { return this._app.resourceManager }
    protected get screen() { return this._app.screen }
    protected get soundLib() { return this._app.soundLib }

    protected constructor(app: GameApp<TResourceID>) {
        this._app = app;
        this._components = new Map();
    }

    protected getComponent<T>(component: TComponent): T {
        return this._components.get(component) as unknown as T;
    }

    protected addComponent(componentRef: TComponent, instance: BaseComponent<TResourceID>) {
        this._components.set(componentRef, instance);
        instance.setContext(this);
        return instance;
    }

    protected removeComponent(component: TComponent): void {
        this._components.delete(component);
    }

    public destroy(): void {
        this._components.forEach(component => component.destroy());
        this._components = undefined;
    }

    public abstract initialize(resource: ResourceManager<TResourceID>): void;
    public abstract update(inputManager: InputManager): void;
    public abstract draw(context: CanvasRenderingContext2D): void;
}
