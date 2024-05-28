import { TComponent } from "./components";
import { BaseComponent } from "./components/base-component";
import { GameApp } from "./game-app";
import { InputManager } from "./input-manager";
import { ResourceManager } from "./resource-manager";

export abstract class GameObject<TResourceID extends string> {
    private app: GameApp<TResourceID>;
    private components: Map<TComponent, BaseComponent<TResourceID>>;
    protected get resourceManager() { return this.app.resourceManager }
    protected get soundLib() { return this.app.soundLib }

    protected constructor(app: GameApp<TResourceID>) {
        this.app = app;
        this.components = new Map();
    }

    protected getComponent<T>(component: TComponent) : T {
        return this.components.get(component) as unknown as T;
    }

    protected addComponent(componentRef: TComponent, instance: BaseComponent<TResourceID>) {
        this.components.set(componentRef, instance);
        instance.setContext(this);
        return instance;
    }

    protected removeComponent(component: TComponent): void {
        this.components.delete(component);
    }

    public destroy(): void {
        this.components.forEach(component => component.destroy());
        this.components = undefined;
    }

    public abstract initialize(resource: ResourceManager<TResourceID>): void;
    public abstract update(inputManager: InputManager): void;
    public abstract draw(context: CanvasRenderingContext2D): void;
}
