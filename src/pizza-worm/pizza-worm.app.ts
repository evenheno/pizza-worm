import { CoreTypes, GameApp } from "../core";
import { Pizza, Worm } from "./game-objects";
import { Backdrop } from "./game-objects/backdrop.go";
import { Constants } from "./pizza-worm.const";
import { Types } from "./pizza-worm.type";

export class PizzaWorm extends GameApp<Types.ResourceID> {
    private _score: number = 0;
    private _worm: Worm;
    private _pizza: Pizza;
    private _backDrop: Backdrop;
    private _gfxBackdrop: HTMLImageElement;
    private _isGameOver: boolean = false;
    private _backgroundMusic: HTMLAudioElement;

    private _pizzaStartTime: number = 0;
    private _totalEatTime: number = 0;
    private _pizzaEatenCount: number = 0;

    public get pizza() { return this._pizza; }
    public get worm() { return this._worm; }
    public get isGameOver() { return this._isGameOver }

    public constructor(container: HTMLCanvasElement) {
        super(container, Constants.RESOURCES);
    }

    protected override async initialize() {
        this._gfxBackdrop = this.resourceManager.get('backdrop');
        this._backgroundMusic = this.resourceManager.get('background-music');
        this._worm = new Worm(this);
        this._backDrop = new Backdrop(this);
        this.generatePizza();
        this.soundLib.playSfx(this._backgroundMusic);
    }

    protected override draw(): void {
        this.drawGfx(this._gfxBackdrop, undefined, this.screen);
        this.drawScore();
        if (this.isGameOver) {
            this.drawOverlay({ alpha: 0.65 });
            this.drawText('GAME OVER', 'center', { fontSize: 27 });
            this.drawText(`Total Score: ${this._score}`, 'center', { offset: [0, 60], fontSize: 17 });
            this.drawText(`Avg. Eating Period: ${this.getAverageEatingPeriod()} Seconds`, 'center', { offset: [0, 90], fontSize: 13 });
        }
    }

    protected override update(): void {
        if (this.isGameOver) return;
        this._worm.update(this.inputManager);
    }

    protected drawScore() {
        this.drawText(`SCORE: ${this._score}`, 'top-left', { offset: [15, 15] });

        const wormPos = this._worm.position;
        const head = `${Math.round(wormPos.x)}x${Math.round(wormPos.y)}`;

        const debugInfo = [
            `FPS: ${this.fps}`,
            `POS: ${head}`,
            `RT ${Math.round(this.runtime)}`,
            `DFC ${Constants.DIFFICULTY}`,
            `P_RAD ${this.pizza.radius}`,
            `AVG_EP ${this.getAverageEatingPeriod()}S`,
        ];

        this.drawText(debugInfo.join(' | '), 'bottom-right', { offset: [10, 10], fontSize: 9 });
        this.drawText('DEVELOPED BY OR EVEN HEN', 'bottom-left', { offset: [10, 10], fontSize: 9, opacity: 0.3 });
    }

    public onEat() {
        const growFactor = Math.floor(this._pizza.radius / 2);
        this._worm.grow(growFactor);
        this._score += growFactor;

        const eatTime = (Date.now() - this._pizzaStartTime) / 1000;
        this._totalEatTime += eatTime;
        this._pizzaEatenCount++;

        this.generatePizza();
    }

    public generatePizza() {
        try {
            const rarityFactor = 3 * Constants.DIFFICULTY;
            const minRadius = Constants.PIZZA_RADIUS[0];
            const maxRadius = Constants.PIZZA_RADIUS[1];
            const randomValue = Math.random();
            const radius = minRadius + Math.round(Math.pow(randomValue, rarityFactor) * (maxRadius - minRadius));

            const randomPos = (bound: number) => Math.floor(Math.random() * (bound - 2 * radius)) + radius;
            let hasCollision: boolean;
            let position: CoreTypes.TVector2D
            do {
                position = { x: randomPos(this.screen.width), y: randomPos(this.screen.height) };
                hasCollision = this.worm.checkCollision(position, radius);
            } while (hasCollision);

            this._pizzaStartTime = Date.now();
            this._pizza = new Pizza(this, position, radius);
        } catch (error) {
            throw Error(`Failed to generate pizza: ${error}`);
        }
    }

    public gameOver() {
        this._isGameOver = true;
    }

    private getAverageEatingPeriod(): number {
        if (this._pizzaEatenCount === 0) return 0;
        return Math.round((this._totalEatTime / this._pizzaEatenCount));
    }
}
