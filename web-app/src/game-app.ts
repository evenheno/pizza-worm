import { Constants } from "./constants";
import { InputManager } from "./input-manager";
import { Pizza } from "./game-objects/pizza.go";
import { ResourceManager } from "./resource-manager";
import { TPizzaWormStartOptions } from "./types";
import { Worm } from "./game-objects/worm.go";
import { SFX } from "./sfx";

export type TResourceID = 'pizza' | 'backdrop';

export class GameApp {

    private container: HTMLCanvasElement;
    public score: number = 0;

    private _resourceManager: ResourceManager<TResourceID> = new ResourceManager();
    private _ctx: CanvasRenderingContext2D;
    private _sfx: SFX = new SFX();

    private inputManager: InputManager = new InputManager();
    private state: 'Idle' | 'Initializing' | 'LoadingRes' | 'Ready';
    private _worm: Worm;
    private _pizza: Pizza;

    public isGameOver: boolean = false;

    public get screen() {
        return { width: this.container.width, height: this.container.height }
    }

    public get ctx() {
        return this._ctx;
    }

    public get sfx() {
        return this._sfx;
    }

    public get pizza() { return this._pizza; }
    public get worm() { return this._worm; }
    public get resourceManager() { return this._resourceManager }

    public constructor(container: HTMLCanvasElement) {
        this.state = 'Idle';
        this.container = container;
        this.initialize();

        container.addEventListener('resize', (ev) => {
            this.screen.width = window.screen.width;
            this.screen.height = window.screen.height;
        });
    }

    public async initialize() {
        console.log('Initializing.');
        this.state = 'Initializing';
        this._ctx = this.container.getContext("2d")!;
        this._ctx.imageSmoothingEnabled = false;

        await this._resourceManager.load(Constants.RESOURCES);
        this._worm = new Worm(this);
        this._pizza = new Pizza(this);
        this.state = 'LoadingRes';

        this.state = 'Ready';
        console.log('Game is ready.');
    }

    public fullScreen() {
        console.log('Activating full-screen.');
        if (!this.container.requestFullscreen) {
            console.warn('Browser does not support full-screen');
            return;
        }
        try {
            this.container.requestFullscreen();
        } catch (error) {
            console.warn(`Failed to set full-screen: ${error}`);
        }
    }

    private update(): void {
        if (!this.isGameOver) {
            this._worm.update(this.inputManager);
            this._pizza.update();
        }
    }

    private drawBackdrop() {
        this._ctx.drawImage(
            this._resourceManager.get("backdrop"), 0, 0,
            this.screen.width, this.screen.height
        );
    }

    private draw(): void {
        this.drawBackdrop();
        this._worm.draw();
        this._pizza.draw();
        this.drawScore();

        if (this.isGameOver) {
            this._ctx.globalAlpha = 0.5;
            this._ctx.fillStyle = 'black';
            this._ctx.fillRect(0, 0, this.screen.width, this.screen.height);
            this._ctx.globalAlpha = 1;
            this.drawGameOver();
        }
    }

    private drawScore() {
        this._ctx.fillStyle = "white";
        this._ctx.font = '10px "DOSFont"';
        this._ctx.fillText(`SCORE: ${this.score}`, 10, 22);
    }

    private drawGameOver() {
        this._ctx.fillStyle = "white";
        this._ctx.font = '13px "DOSFont"';
        const x = this.screen.width / 2;
        const y = this.screen.height / 2;
        this._ctx.fillText(`Game Over`, x, y);
    }

    private gameTick(): void {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameTick());
    }

    public start(options?: TPizzaWormStartOptions): void {
        if (this.state !== 'Ready') {
            throw Error('Unable to start game, state is not ready.');
        }
        this._pizza.place();
        this.gameTick(); // Start the game loop
        if (options?.fullScreen) this.fullScreen();
    }
}
