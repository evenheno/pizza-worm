import { GameApp } from "../core/game-app";
import { Constants } from "./constants";
import { Pizza } from "./game-objects/pizza.go";
import { Worm } from "./game-objects/worm.go";
import { TVector2D } from "./types";

export type TResourceID = 'pizza' | 'backdrop';

export class PizzaWorm extends GameApp<TResourceID> {
    private _score: number = 0;
    private _worm: Worm;
    private _pizza: Pizza;
    private _gfxBackdrop: HTMLImageElement;
    private _isGameOver: boolean = false;

    private _pizzaStartTime: number = 0;
    private _totalEatTime: number = 0;
    private _pizzaEatenCount: number = 0;

    public get pizza() { return this._pizza; }
    public get worm() { return this._worm; }
    public get isGameOver() { return this._isGameOver }

    protected override async initialize() {
        this._gfxBackdrop = this.resource.get('backdrop');
        this._worm = new Worm(this);
        this.generatePizza();
    }

    protected override draw(): void {
        this.drawGfx(this._gfxBackdrop, undefined, this.screen);
        this._worm.draw();
        this._pizza.draw();
        this.drawScore();

        if (this.isGameOver) {
            this.drawOverlay({ alpha: 0.7 });
            this.drawText('GAME OVER', 'Center', { fontSize: 20 });
            this.drawText([
                `Total Score: ${this._score}`,
                `Average Eating Time: ${this.getAverageEatTime()} Seconds`
            ], 'Center', { offset: [0, 30], fontSize: 17 });
        }
    }

    protected override update(): void {
        if (this.isGameOver) return;
        this._worm.update(this.input);
    }

    public constructor(container: HTMLCanvasElement) {
        super(container, Constants.RESOURCES);
    }

    protected drawScore() {
        this.drawText(`SCORE: ${this._score}`, 'TopLeft', { offset: [15, 15] });

        const wormPos = this._worm.position;
        const head = `${Math.round(wormPos.x)}x${Math.round(wormPos.y)}`;

        const debugInfo = [
            `FPS: ${this.fps}`,
            `POS: ${head}`,
            `RT ${this.runtime}`,
            `DIF ${Constants.DIFFICULTY}`,
            `PIZ_RAD ${this.pizza.radius}`,
            `AVG_ET ${this.getAverageEatTime()}S`
        ];

        this.drawText(debugInfo.join(' | '), 'BottomRight', { offset: [10, 10], fontSize: 9 });
    }

    public onEat() {
        const growFactor = Math.floor(this._pizza.radius / 2);
        this.sfx.playCoinChipSound();
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
            let position: TVector2D
            do {
                position = { x: randomPos(this.screen.width), y: randomPos(this.screen.height) };
                hasCollision = this.worm.collidesWith(position, radius);
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

    private getAverageEatTime(): number {
        if (this._pizzaEatenCount === 0) return 0;
        return Math.round((this._totalEatTime / this._pizzaEatenCount));
    }
}
