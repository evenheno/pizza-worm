import { CoreTypes } from "./core.type";
import { GameApp } from "./game-app";
import { GameObject } from "./game-object";
import { InputManager } from "./input-manager";
import { Logger } from "./logger";
import { ResourceManager } from "./resource-manager";
import { Camera } from "./camera";

export abstract class Scene<TResourceID extends string, TGameObjectID extends string> {
    private _id: string;
    private _app: GameApp<TResourceID, TGameObjectID>;
    private _logger: Logger;
    private _gameObjects: Map<TGameObjectID, GameObject<TResourceID, TGameObjectID>>;
    private _initialized: boolean;
    private _started: boolean;

    protected get app() { return this._app; }
    protected get logger() { return this._logger; }
    public get id() { return this._id; }

    public constructor(id: string, app: GameApp<TResourceID, TGameObjectID>) {
        this._id = id;
        this._app = app;
        this._logger = new Logger(`Scene:${id}`);
        this._gameObjects = new Map();
        this._initialized = false;
        this._started = false;
    }

    public addObject(id: TGameObjectID, gameObject: GameObject<TResourceID, TGameObjectID>) {
        this._logger.log('Adding game object.', id);
        this._gameObjects.set(id, gameObject);
    }

    public removeObject(id: TGameObjectID): void {
        this._logger.log('Removing game object.', id);
        this._gameObjects.delete(id);
    }

    public getObject<T>(id: TGameObjectID): T {
        const target = this._gameObjects.get(id);
        if (!target) throw new Error(`Game object not found: ${id}`);
        return target as unknown as T;
    }

    public ensureInitialized(resourceManager: ResourceManager<TResourceID>): void {
        if (this._initialized) return;
        this._logger.log('Initializing scene.');
        this.onInitialize(resourceManager);
        const objects = Array.from(this._gameObjects.values());
        for (let i = 0; i < objects.length; i++) {
            objects[i].initialize(resourceManager);
        }
        this._initialized = true;
    }

    public ensureStarted(): void {
        if (this._started) return;
        this._logger.log('Starting scene.');
        const objects = Array.from(this._gameObjects.values());
        for (let i = 0; i < objects.length; i++) {
            objects[i].start();
        }
        this.onStart();
        this._started = true;
    }

    public update(inputManager: InputManager, deltaTime: number): void {
        const objects = Array.from(this._gameObjects.values());
        for (let i = 0; i < objects.length; i++) {
            const gameObject = objects[i];
            if (!gameObject.enableUpdate) continue;
            gameObject.update(inputManager, deltaTime);
        }
        this.onUpdate(inputManager, deltaTime);
    }

    public draw(ctx: CanvasRenderingContext2D, camera?: Camera): void {
        if (camera) camera.begin(ctx);
        const objects = Array.from(this._gameObjects.values());
        for (let i = 0; i < objects.length; i++) {
            objects[i].draw(ctx);
        }
        if (camera) camera.end(ctx);
        this.onDraw(ctx);
    }

    public enter(previousSceneId?: string): void {
        this._logger.log('Entering scene.', previousSceneId);
        this.onEnter(previousSceneId);
    }

    public exit(nextSceneId?: string): void {
        this._logger.log('Exiting scene.', nextSceneId);
        this.onExit(nextSceneId);
    }

    public destroy(): void {
        const objects = Array.from(this._gameObjects.values());
        for (let i = 0; i < objects.length; i++) {
            objects[i].destroy();
        }
        this._gameObjects.clear();
        this._initialized = false;
        this._started = false;
    }

    protected abstract onInitialize(resourceManager: ResourceManager<TResourceID>): void;
    protected onStart(): void { }
    protected onEnter(previousSceneId?: string): void { }
    protected onExit(nextSceneId?: string): void { }
    protected onUpdate(inputManager: InputManager, deltaTime: number): void { }
    protected onDraw(ctx: CanvasRenderingContext2D): void { }
}
