import { CoreTypes, GameApp, InputManager, ResourceManager, SoundLib } from "../core";
import { Pizza, Worm } from "./game-objects";
import { Backdrop } from "./game-objects/backdrop.go";
import { Constants } from "./pizza-worm.const";
import { Types } from "./pizza-worm.type";

export class PizzaWorm extends GameApp<Types.ResourceID, Types.GameObjectID> {
    private _score: number = 0;
    private _lastEatingTime: number = 0;
    private _totalEatTime: number = 0;
    private _totalPizzasEaten: number = 0;
    private _gameOver: boolean;

    public constructor(container: HTMLCanvasElement) {
        super(container, Constants.RESOURCES);
    }

    protected override async onInitialize(resourceManager: ResourceManager<Types.ResourceID>) {
        this.addObject('Backdrop', new Backdrop(this));
        this.addObject('Pizza', new Pizza(this));
        this.addObject('Worm', new Worm(this, { onSelfCollision: this.onWormSelfCollision.bind(this) }));
        this.placePizza();
    }

    protected override async onStart(resourceManager: ResourceManager<Types.ResourceID>, soundLib: SoundLib): Promise<void> {
        this.logger.log('Starting background music.');
        const audioTrackData: HTMLAudioElement = resourceManager.get('background-music');
        soundLib.playSfx(audioTrackData, { repeat: true, volume: 0.7 });
    }

    protected override onDraw() {
        const pizza: Pizza = this.getObject('Pizza');
        const worm: Worm = this.getObject('Worm');

        this.drawText(`SCORE: ${this._score}`, 'top-left', { offset: [15, 15] });

        const wormPos = worm.position;
        const head = `${Math.round(wormPos.x)}x${Math.round(wormPos.y)}`;

        const debugInfo = [
            `FPS: ${this.fps}`, `POS: ${head}`,
            `RT ${Math.round(this.runtime)}`,
            `DFC ${Constants.DIFFICULTY}`, `P_RAD ${pizza.radius}`,
            `AVG_EP ${this.getAverageEatingPeriod()}S`,
        ].join(' ');

        this.drawText('Developed by Or Even Hen', 'bottom-left', { offset: [10, 10], fontSize: 12 })
        this.drawText(debugInfo, 'bottom-right', { offset: [10, 10], fontSize: 9 });

        if (this._gameOver) {
            this.drawOverlay({ alpha: 0.65 });
            this.drawText('GAME OVER', 'center', { fontSize: 27 });
            this.drawText(`Total Score: ${this._score}`, 'center', { offset: [0, 60], fontSize: 17 });
            this.drawText(`Avg. Eating Period: ${this.getAverageEatingPeriod()} Seconds`, 'center', { offset: [0, 90], fontSize: 13 });
        }
    }


    protected override onUpdate(inputManager: InputManager) {
        if (this._gameOver) return;
        this.detectPizzaCollision();
    }

    private detectPizzaCollision(): void {
        const pizza: Pizza = this.getObject('Pizza');
        const worm: Worm = this.getObject('Worm');
        const pizzaPos = pizza.position;
        const pizzaRadius = pizza.radius;
        const hasCollision = worm.checkCollision(pizzaPos, pizzaRadius);
        if (hasCollision) {
            this.logger.log('Pizza collision detected.');
            const growFactor = Math.floor(pizza.radius / 2);
            worm.grow(growFactor);
            this._score += growFactor;
            const eatTime = (Date.now() - this._lastEatingTime) / 1000;
            this._totalEatTime += eatTime;
            this._totalPizzasEaten++;
            this.placePizza();
            this.playCoinChipSound();
        }
    }

    public placePizza() {
        try {
            this.logger.log('Placing pizza.');
            const pizza: Pizza = this.getObject('Pizza');
            const worm: Worm = this.getObject('Worm');

            const rarityFactor = 3 * Constants.DIFFICULTY;
            const minRadius = Constants.PIZZA_RADIUS[0];
            const maxRadius = Constants.PIZZA_RADIUS[1];
            const randomValue = Math.random();
            const radius = minRadius + Math.round(Math.pow(randomValue, rarityFactor) * (maxRadius - minRadius));
            pizza.radius = radius;


            const randomPos = (bound: number) => Math.floor(Math.random() * (bound - 2 * radius)) + radius;
            let hasCollision: boolean;
            let position: CoreTypes.TVector2D
            do {
                position = { x: randomPos(this.screen.width), y: randomPos(this.screen.height) };
                hasCollision = worm.checkCollision(position, radius);
            } while (hasCollision);
            pizza.position = position;
            this._lastEatingTime = Date.now();
        } catch (error) {
            throw Error(`Failed to place pizza: ${error}`);
        }
    }

    public onWormSelfCollision() {
        const worm: Worm = this.getObject('Worm');
        this._gameOver = true;
        worm.enableUpdate = false;
        this.playGameOverSound();
        setTimeout(() => {
            this.logger.log('Restarting.');
            this.reset();
        }, 10000);
    }

    public playGameOverSound() {
        //TODO: Implement
    }

    public playCoinChipSound() {
        const baseFrequencies = [1500, 1200, 1800, 1000, 1500];
        const baseDelays = [0.1, 0.1, 0.1, 0.1, 0.1];
        const baseFilterFrequencies = [1200, 1000, 1400, 800, 1200];
        const baseDetunes = [5, 7, 0, 10, -10];
        baseFrequencies.forEach((freq, index) => {
            const randomFactor = (Math.random() - 0.5) * 0.2; // Random factor between -0.1 and 0.1
            const frequency = 500 + freq + freq * randomFactor;
            const delayTime = baseDelays[index] + (Math.random() - 0.5) * 0.05;
            const filterFrequency = baseFilterFrequencies[index] + baseFilterFrequencies[index] * randomFactor;
            const detune = baseDetunes[index] + (Math.random() - 0.5) * 20;
            setTimeout(() => {
                this.soundLib.playFreq({
                    duration: 0.5,
                    frequency: frequency,
                    filterFrequency: filterFrequency,
                    delayTime: delayTime,
                    detune: detune,
                    volume: 1,
                    type: 'sine'
                });
            }, index * 100);
        });
    }

    public reset() {
        const worm: Worm = this.getObject('Worm');
        this._score = 0;
        this._lastEatingTime = (Date.now() - this._lastEatingTime) / 1000;
        this._totalEatTime = 0;
        this._totalPizzasEaten = 0;
        this.placePizza();
        worm.reset();
        this._gameOver = false;
        worm.enableUpdate = true;
    }

    private getAverageEatingPeriod(): number {
        if (this._totalPizzasEaten === 0) return 0;
        return Math.round((this._totalEatTime / this._totalPizzasEaten));
    }
}
