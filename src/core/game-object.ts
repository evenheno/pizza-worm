import { TComponent } from "./components";
import { BaseComponent } from "./components/base-component";
import { GameApp } from "./game-app";
import { InputManager } from "./input-manager";
import { Logger } from "./logger";
import { ResourceManager } from "./resource-manager";

export interface IGameObject<TResourceID extends string> {
    initialize(resource: ResourceManager<TResourceID>): void;
    update(inputManager: InputManager, deltaTime: number): void;
    draw(context: CanvasRenderingContext2D): void;
}

export abstract class GameObject
    <TResourceID extends string, TGameObjectID extends string>
    implements IGameObject<TResourceID> {

    private _app: GameApp<TResourceID, TGameObjectID>;
    private _logger: Logger;
    private _components: Map<TComponent, BaseComponent<TResourceID, TGameObjectID>>;
    private _id: TGameObjectID;
    public enableUpdate: boolean;

    protected get app() { return this._app }
    protected get screen() { return this._app.screen }
    protected get soundLib() { return this._app.soundLib }
    protected get audioManager() { return this._app.audioManager }
    protected get spriteManager() { return this._app.spriteManager }
    protected get cameraManager() { return this._app.cameraManager }
    protected get logger() { return this._logger }
    public get id() { return this._id }

    protected constructor(id: TGameObjectID, app: GameApp<TResourceID, TGameObjectID>) {
        this._logger = new Logger(id);
        this._logger.log('Creating game object.', id);
        this._id = id;
        this._app = app;
        this._components = new Map();
        this._logger.log('Game object created.');
        this.enableUpdate = true;
    }

    protected getComponent<T>(component: TComponent): T {
        return this._components.get(component) as unknown as T;
    }

    public tryGetComponent<T>(component: TComponent): T | undefined {
        return this._components.get(component) as unknown as T | undefined;
    }

    public hasComponent(component: TComponent): boolean {
        return this._components.has(component);
    }

    public addComponent<T extends BaseComponent<TResourceID, TGameObjectID>>(componentRef: TComponent, instance: T): T {
        this._components.set(componentRef, instance);
        instance.setContext(this);
        return instance;
    }

    protected removeComponent(component: TComponent): void {
        this._components.delete(component);
    }

    public destroy(): void {
        this._components.forEach(component => component.destroy());
        this._components = new Map();
    }

    public abstract initialize(resource: ResourceManager<TResourceID>): void;
    public abstract update(inputManager: InputManager, deltaTime: number): void;
    public abstract draw(context: CanvasRenderingContext2D): void;
    public abstract start(): void;
}
