import { InputManager } from "./managers/input-manager";
import { ComponentManager } from "./managers/component-manager";
import { EventManager } from "./managers/event-manager";
import { SceneManager } from "./managers/scene-manager";
import { ResourceManager } from "./managers/resource-manager";
import { BaseRenderer } from "./renderers/base-renderer";
import { IGameEvent, TGameAppOptions, TResourcesMap } from "./types";

export abstract class GameApp {
    private sceneManager: SceneManager;
    private eventManager: EventManager;
    private inputManager: InputManager;
    private resourceManager: ResourceManager;
    private renderer: BaseRenderer;
    private options: TGameAppOptions;
    private container: HTMLCanvasElement;

    onDraw: (renderer: BaseRenderer) => void;
    onUpdate: (deltaTime: number) => void;
    onEvent: (event: IGameEvent<unknown>) => void;
    onLoadResources: (resourceManager: ResourceManager) => TResourcesMap;

    constructor(options: TGameAppOptions) {
        try {
            this.container = options.container;
            this.sceneManager = new SceneManager(this);
            this.eventManager = new EventManager(this);
            this.inputManager = new InputManager(this);
            this.resourceManager = new ResourceManager(this);
            this.options = options;
            this.createRenderer();
        } catch (error) {
            throw Error(`Failed to initialize game app: ${error}`);
        }
    }

    private createRenderer() {
        try {
            const Renderer = this.options.renderer;
            const targetContainer = this.options.container;
            this.renderer = new Renderer(targetContainer);
        } catch (error) {
            throw Error(`Failed to initialize renderer: ${error}`);
        }
    }

    private startMainLoop() {
        requestAnimationFrame(this.onAnimationFrame.bind(this));
    }

    private onAnimationFrame() {
        try {
            const deltaTime = 0;
            this.sceneManager.onDraw(this.renderer);
            this.onDraw ?? (this.renderer);
            this.sceneManager.onUpdate(deltaTime);
            this.onUpdate ?? (deltaTime);
            this.startMainLoop();
        } catch (error) {
            throw Error(`Runtime error: ${error}`);
        }
    }

    public async start() {
        try {
            await this.onLoadResources(this.resourceManager);
            await this.renderer.initialize();
            this.startMainLoop();
        } catch (error) {
            throw Error(`Failed to start game app: ${error}`);
        }
    }

}
