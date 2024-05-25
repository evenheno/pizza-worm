import { ComponentBase } from "../components/component-base";
import { ComponentManager } from "../managers/component-manager";
import { BaseRenderer } from "../renderers/base-renderer";
import { IGameEvent } from "../types";
import { GameApp } from "../game-app";

export class GameObject {
    private componentManager: ComponentManager;
    private app: GameApp;

    constructor(app: GameApp) {
        this.app = app;
    }

    public addComponent(id: string, component: ComponentBase): void {
        this.componentManager.addComponent(id, component);
    }

    public getComponent<T extends ComponentBase>(type: new () => T): T {
        return this.componentManager.getComponent<T>(type);
    }

    public onDraw(renderer: BaseRenderer): void {
        this.componentManager.onDraw(renderer);
    }

    public onUpdate(deltaTime: number): void {
        this.componentManager.onUpdate(deltaTime);
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

    public onCollision(other: GameObject): void {
        // Override this method in subclasses to handle collision logic
    }

    public handleEvent<T>(event: IGameEvent<T>): void {
        this.componentManager.handleEvent(event);
    }
}