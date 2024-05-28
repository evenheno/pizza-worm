import { ComponentBase } from "../components/component-base";
import { ComponentManager } from "../managers/component-manager";
import { BaseRenderer } from "../renderers/base-renderer";
import { IGameEvent } from "../types";
import { GameApp } from "../game-app";

export class GameObject<T> {
    private _app: GameApp;
    private _component: ComponentManager;

    public get app() { return this._app; }
    public get component() { return this._component }

    constructor(app: GameApp) {
        this._app = app;
    }

    public addComponent<T extends ComponentBase>(id: string, component: T): void {
        this._component.addComponent(id, component);
    }

    public getComponent<T extends ComponentBase>(type: new () => T): T {
        return this._component.getComponent<T>(type);
    }

    public onDraw(renderer: BaseRenderer): void {
        this._component.onDraw(renderer);
    }

    public onUpdate(deltaTime: number): void {
        this._component.onUpdate(deltaTime);
    }

    public update(): void {
        // Override this method in subclasses to implement custom update logic
    }

    public onInit(): void {
        // Initialize the game object
    }

    public onDestroy(): void {
        // Cleanup the game object
    }

    public onCollision(other: GameObject<T>): void {
        // Override this method in subclasses to handle collision logic
    }

    public handleEvent<T>(event: IGameEvent<T>): void {
        this._component.handleEvent(event);
    }
}