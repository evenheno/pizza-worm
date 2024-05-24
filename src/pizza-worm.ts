import { Const } from "./const";
import { GameObjects } from "./game-objects.ns";
import { InputManager } from "./input-manager";
import { ResourceManager } from "./resource-manager";
import { TPizzaWormStartOptions } from "./types";
import { Util } from "./util";
export class PizzaWormGame {
    private wormLength = 40;
    private container: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private score: number = 0;

    private resourceManager: ResourceManager = new ResourceManager();
    private inputManager: InputManager = new InputManager();
    private worm: GameObjects.Worm;
    private pizza: GameObjects.Pizza;
    private state: 'Idle' | 'Initializing' | 'LoadingRes' | 'Ready';

    public constructor(container: HTMLCanvasElement) {
        this.state = 'Idle';
        this.container = container;
        this.initialize();
    }

    public async initialize() {
        console.log('Initializing.');
        this.state = 'Initializing';
        this.ctx = this.container.getContext("2d")!;
        this.ctx.imageSmoothingEnabled = false;

        this.worm = new GameObjects.Worm(
            this.container.width,
            this.container.height,
            this.wormLength,
            Const.WORM_THICKNESS,
            Const.SPEED,
            Const.WORM_COLORS
        );
        this.pizza = new GameObjects.Pizza(Const.PIZZA_RADIUS);
        this.state = 'LoadingRes';
        await this.resourceManager.load(Const.RESOURCES);
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
        if (!this.worm || !this.pizza || !this.container) return;

        this.worm.turningLeft = this.inputManager.isTurningLeft();
        this.worm.turningRight = this.inputManager.isTurningRight();
        this.worm.updateAngle(Const.TURNING_SPEED);
        this.worm.move(this.container.width, this.container.height);
        this.worm.trim();
        if (
            this.worm.collidesWith(
                this.pizza.position!.x,
                this.pizza.position!.y,
                Const.PIZZA_RADIUS
            )
        ) {
            this.wormLength += Math.floor(Const.PIZZA_RADIUS / 2);
            this.score += 10;
            this.pizza.place(this.worm, this.container.width, this.container.height);
        }
    }

    private draw(): void {
        if (!this.ctx || !this.worm || !this.pizza || !this.container) return;

        this.ctx.clearRect(0, 0, this.container.width, this.container.height);
        this.ctx.drawImage(
            this.resourceManager.getResource("backdrop"), 0, 0,
            this.container.width, this.container.height
        );
        this.worm.draw(this.ctx);
        this.pizza.draw(this.ctx, this.resourceManager.getResource("pizza"));

        // Draw the score in the top left corner
        this.ctx.fillStyle = "white";
        this.ctx.font = '10px "DOSFont"';
        this.ctx.fillText(`SCORE: ${this.score}`, 10, 22);
    }

    private gameTick(): void {
        this.update();
        this.draw();
    }

    public start(options?: TPizzaWormStartOptions): void {
        if (this.state !== 'Ready') {
            throw Error('Unable to start game, state is not ready.');
        }
        this.pizza.place(this.worm, this.container.width, this.container.height);
        setInterval(() => this.gameTick(), 1000 / 60);
        if (options?.fullScreen) this.fullScreen();
    }
}