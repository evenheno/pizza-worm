import { InputManager } from "../managers/input-manager";
import { ComponentManager } from "../managers/component-manager";
import { EventManager } from "../managers/event-manager";
import { SceneManager } from "../managers/scene-manager";
import { ResourceManager } from "../managers/resource-manager";
import { IGameEvent } from "../types/game-event.interface";
import { BaseRenderer } from "../renderers/base-renderer";
import { CanvasRenderer } from "../renderers/canvas-renderer";

export abstract class Game {
    private scene: SceneManager;
    private event: EventManager;
    private input: InputManager;
    private resource: ResourceManager;
    private component: ComponentManager;
    private renderer: BaseRenderer;

    onDraw: (renderer: BaseRenderer) => void;
    onUpdate: (deltaTime: number) => void;
    onEvent: (event: IGameEvent<unknown>) => void;

    constructor(options: { container: HTMLCanvasElement }) {
        this.scene = new SceneManager(this);
        this.event = new EventManager(this);
        this.input = new InputManager(this);
        this.resource = new ResourceManager(this);
        this.component = new ComponentManager(this);
        this.renderer = new CanvasRenderer(options.container);
    }


    public start() {
        this.requestNext();
    }

    private requestNext() {
        requestAnimationFrame(this.onAnimationFrame.bind(this));
    }

    private onAnimationFrame() {
        const deltaTime = 0;
        
        this.scene.onDraw(this.renderer);
        this.onDraw ?? (this.renderer);

        this.scene.onUpdate(deltaTime);
        this.onUpdate ?? (deltaTime);

        this.requestNext();
    }

}
