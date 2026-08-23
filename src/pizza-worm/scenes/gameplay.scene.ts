import { Button, CircleColliderComponent, CollisionSystem, CoreTypes, InputManager, ResourceManager, Scene } from "../../core";
import { Constants } from "../pizza-worm.const";
import { Types } from "../pizza-worm.type";
import { Backdrop, Pizza, PizzaParticles, Worm } from "../game-objects";
import { PizzaWorm } from "../pizza-worm.app";

export class GameplayScene extends Scene<Types.ResourceID, Types.GameObjectID> {
    private static readonly PIZZA_PLACEMENT_ATTEMPTS = 250;
    private static readonly MIN_PIZZA_RADIUS = 4;

    private _score: number = 0;
    private _lastEatingTime: number = 0;
    private _totalEatTime: number = 0;
    private _totalPizzasEaten: number = 0;
    private _gameOver: boolean = false;
    private _restartTimer: number | null = null;
    private _collisionSystem: CollisionSystem = new CollisionSystem();
    private _wormHeadCollider?: CircleColliderComponent<Types.ResourceID, Types.GameObjectID>;
    private _paused: boolean = false;

    private get game() { return this.app as PizzaWorm; }

    public constructor(app: PizzaWorm) {
        super('gameplay', app);
    }

    protected override onInitialize(resourceManager: ResourceManager<Types.ResourceID>): void {
        this.addObject('Backdrop', new Backdrop(this.app));
        this.addObject('Pizza', new Pizza(this.app));
        this.addObject('PizzaParticles', new PizzaParticles(this.app));
        this.addObject('Worm', new Worm(this.app, { onSelfCollision: this.onWormSelfCollision.bind(this) }));

        this.app.inputManager.bindAction('TogglePause', ['Space']);

        const buttonWidth = 248;
        const buttonHeight = 36;
        const buttonSpacing = 12;
        const buttonX = Math.floor((this.app.screen.width - buttonWidth) / 2);
        const topY = Math.floor(this.app.screen.height / 2) - (buttonHeight * 2 + buttonSpacing * 1.5);
        const buttonStyle = {
            background: '#1F331B',
            border: '#8FCB3F',
            text: '#FDF8D3',
            hoverBackground: '#2A471F',
            hoverBorder: '#DFF16D',
            hoverText: '#FFFDEB',
            activeBackground: '#376325',
            activeBorder: '#FFF28D',
            activeText: '#FFFFFF',
            disabledBackground: '#1A2616',
            disabledBorder: '#4F6D3A',
            disabledText: '#A6B593'
        };

        this.addObject('BtnSound', new Button('BtnSound', this.app, {
            x: buttonX,
            y: topY,
            width: buttonWidth,
            height: buttonHeight,
            fontSize: 14,
            borderRadius: 9,
            borderWidth: 3,
            style: buttonStyle,
            visible: () => this._paused && !this._gameOver,
            enabled: () => this._paused && !this._gameOver,
            label: () => `Sound: ${this.game.isSoundEnabled ? 'On' : 'Off'}`,
            onClick: () => this.game.setSoundEnabled(!this.game.isSoundEnabled)
        }));

        this.addObject('BtnMusic', new Button('BtnMusic', this.app, {
            x: buttonX,
            y: topY + (buttonHeight + buttonSpacing),
            width: buttonWidth,
            height: buttonHeight,
            fontSize: 14,
            borderRadius: 9,
            borderWidth: 3,
            style: buttonStyle,
            visible: () => this._paused && !this._gameOver,
            enabled: () => this._paused && !this._gameOver,
            label: () => `Music: ${this.game.isMusicEnabled ? 'On' : 'Off'}`,
            onClick: () => this.game.setMusicEnabled(!this.game.isMusicEnabled)
        }));

        this.addObject('BtnPause', new Button('BtnPause', this.app, {
            x: buttonX,
            y: topY + (buttonHeight + buttonSpacing) * 2,
            width: buttonWidth,
            height: buttonHeight,
            fontSize: 14,
            borderRadius: 9,
            borderWidth: 3,
            style: buttonStyle,
            visible: () => this._paused && !this._gameOver,
            enabled: () => this._paused && !this._gameOver,
            label: () => this._paused ? 'Resume' : 'Pause',
            onClick: () => this.setPaused(!this._paused)
        }));

        this.addObject('BtnAbout', new Button('BtnAbout', this.app, {
            x: buttonX,
            y: topY + (buttonHeight + buttonSpacing) * 3,
            width: buttonWidth,
            height: buttonHeight,
            fontSize: 14,
            borderRadius: 9,
            borderWidth: 3,
            style: buttonStyle,
            visible: () => this._paused && !this._gameOver,
            enabled: () => this._paused && !this._gameOver,
            label: 'About',
            onClick: () => this.app.switchScene('about', { durationMs: 260, color: '#06080F' })
        }));

        const restartWidth = 168;
        const restartHeight = 42;
        const restartX = Math.floor(this.app.screen.width / 2) + 116;
        const restartY = Math.floor(this.app.screen.height / 2) - Math.floor(restartHeight / 2) - 2;

        this.addObject('BtnRestart', new Button('BtnRestart', this.app, {
            x: restartX,
            y: restartY,
            width: restartWidth,
            height: restartHeight,
            fontSize: 16,
            borderRadius: 10,
            borderWidth: 3,
            style: {
                background: '#4C2018',
                border: '#F8833A',
                text: '#FFE5C5',
                hoverBackground: '#6B2C1D',
                hoverBorder: '#FFB56B',
                hoverText: '#FFF5E9',
                activeBackground: '#8C3A1F',
                activeBorder: '#FFD39A',
                activeText: '#FFFFFF',
                disabledBackground: '#321C17',
                disabledBorder: '#6A4A3B',
                disabledText: '#C19A87'
            },
            visible: () => this._gameOver,
            enabled: () => this._gameOver,
            label: 'Restart',
            onClick: () => this.reset()
        }));
    }

    protected override onStart(): void {
        this.placePizza();
        if (this.game.isMusicEnabled) {
            this.app.audioManager.play('background-music', { repeat: true, volume: 0.7 });
        }

        const worm: Worm = this.getObject('Worm');
        const pizza: Pizza = this.getObject('Pizza');

        this._collisionSystem.clear();
        this._wormHeadCollider = worm.addComponent(CircleColliderComponent, new CircleColliderComponent<Types.ResourceID, Types.GameObjectID>({
            tag: 'worm-head',
            getCenter: () => worm.position,
            getRadius: () => Constants.WORM_THICKNESS / 2,
        }));
        const pizzaCollider = pizza.addComponent(CircleColliderComponent, new CircleColliderComponent<Types.ResourceID, Types.GameObjectID>({
            tag: 'pizza',
            getCenter: () => pizza.position,
            getRadius: () => pizza.radius,
            onCollisionEnter: (other) => {
                if (other !== this._wormHeadCollider) return;
                this.onPizzaEaten();
            }
        }));

        this._collisionSystem.add(this._wormHeadCollider);
        this._collisionSystem.add(pizzaCollider);
    }

    protected override onUpdate(inputManager: InputManager, deltaTime: number): void {
        if (!this._gameOver && inputManager.wasActionPressed('TogglePause')) {
            this.setPaused(!this._paused);
        }

        if (this._gameOver) return;
        if (this._paused) return;
        this._collisionSystem.update();
    }

    protected override onDraw(ctx: CanvasRenderingContext2D): void {
        const pizza: Pizza = this.getObject('Pizza');
        const worm: Worm = this.getObject('Worm');

        this.app.drawText(`SCORE: ${this._score}`, 'top-left', { offset: [15, 15] });

        const wormPos = worm.position;
        const head = `${Math.round(wormPos.x)}x${Math.round(wormPos.y)}`;

        const debugInfo = [
            `FPS: ${this.app.fps}`,
            `POS: ${head}`,
            `RT ${Math.round(this.app.runtime)}`,
            `DFC ${Constants.DIFFICULTY}`,
            `P_RAD ${pizza.radius}`,
            `AVG_EP ${this.getAverageEatingPeriod()}S`,
        ].join(' ');

        this.app.drawText('Developed by Or Even Hen', 'bottom-left', { offset: [10, 10], fontSize: 12 });
        this.app.drawText(debugInfo, 'bottom-right', { offset: [10, 10], fontSize: 9 });

        if (this._gameOver) {
            this.app.drawOverlay({ alpha: 0.65 });
            this.app.drawText('GAME OVER', 'center', { fontSize: 27 });
            this.app.drawText(`Total Score: ${this._score}`, 'center', { offset: [0, 60], fontSize: 17 });
            this.app.drawText(`Avg. Eating Period: ${this.getAverageEatingPeriod()} Seconds`, 'center', { offset: [0, 90], fontSize: 13 });
            this.drawUiObjects(ctx, ['BtnRestart']);
        } else if (this._paused) {
            this.app.drawOverlay({ alpha: 0.5 });
            this.app.drawText('PAUSED', 'center', { offset: [0, -130], fontSize: 28 });
            this.app.drawText('Press Space to Resume', 'center', { offset: [0, 138], fontSize: 13, color: '#C8D6F8' });
            this.drawUiObjects(ctx, ['BtnSound', 'BtnMusic', 'BtnPause', 'BtnAbout']);
        }
    }

    private drawUiObjects(ctx: CanvasRenderingContext2D, ids: Types.GameObjectID[]): void {
        for (let i = 0; i < ids.length; i++) {
            const object = this.getObject<{ draw: (context: CanvasRenderingContext2D) => void }>(ids[i]);
            object.draw(ctx);
        }
    }

    private onPizzaEaten(): void {
        const pizza: Pizza = this.getObject('Pizza');
        const particles: PizzaParticles = this.getObject('PizzaParticles');
        const worm: Worm = this.getObject('Worm');

        this.logger.log('Pizza collision detected.');
        const burstPosition = { x: pizza.position.x, y: pizza.position.y };
        const burstRadius = pizza.radius;
        const burstColor = pizza.currentGlowColor;
        const growFactor = Math.floor(pizza.radius / 2);
        worm.grow(growFactor);
        this._score += growFactor;
        const eatTime = (Date.now() - this._lastEatingTime) / 1000;
        this._totalEatTime += eatTime;
        this._totalPizzasEaten++;
        const didPlacePizza = this.placePizza();
        if (didPlacePizza) {
            particles.emitBurst(burstPosition, burstRadius, burstColor);
            this.playCoinChipSound();
        }
    }

    private placePizza(): boolean {
        try {
            this.logger.log('Placing pizza.');
            const pizza: Pizza = this.getObject('Pizza');
            const worm: Worm = this.getObject('Worm');

            const radius = this.getRandomPizzaRadius();
            const position = this.findPizzaPosition(worm, radius);
            if (!position) {
                this.logger.log('No valid pizza position found.');
                this.onWormSelfCollision();
                return false;
            }

            pizza.radius = radius;
            pizza.position = position;
            pizza.replaceSprite();
            this._lastEatingTime = Date.now();
            return true;
        } catch (error) {
            throw Error(`Failed to place pizza: ${error}`);
        }
    }

    private getRandomPizzaRadius(): number {
        const rarityFactor = 3 * Constants.DIFFICULTY;
        const maxPlayableRadius = Math.max(
            GameplayScene.MIN_PIZZA_RADIUS,
            Math.floor(Math.min(this.app.screen.width, this.app.screen.height) / 2) - 1
        );
        const maxRadius = Math.min(Constants.PIZZA_RADIUS[1], maxPlayableRadius);
        const minRadius = Math.min(Constants.PIZZA_RADIUS[0], maxRadius);
        const randomValue = Math.random();
        return minRadius + Math.round(Math.pow(randomValue, rarityFactor) * (maxRadius - minRadius));
    }

    private findPizzaPosition(worm: Worm, radius: number): CoreTypes.TVector2D | null {
        for (let attempt = 0; attempt < GameplayScene.PIZZA_PLACEMENT_ATTEMPTS; attempt++) {
            const position = this.getRandomPizzaPosition(radius);
            if (!worm.checkCollision(position, radius)) return position;
        }

        return this.findGridPizzaPosition(worm, radius);
    }

    private getRandomPizzaPosition(radius: number): CoreTypes.TVector2D {
        const randomPos = (bound: number) => {
            const min = radius;
            const max = bound - radius;
            if (max <= min) return bound / 2;
            return Math.floor(Math.random() * (max - min)) + min;
        };

        return { x: randomPos(this.app.screen.width), y: randomPos(this.app.screen.height) };
    }

    private findGridPizzaPosition(worm: Worm, radius: number): CoreTypes.TVector2D | null {
        const step = Math.max(radius, Constants.WORM_THICKNESS);
        const maxX = this.app.screen.width - radius;
        const maxY = this.app.screen.height - radius;

        for (let y = radius; y <= maxY; y += step) {
            for (let x = radius; x <= maxX; x += step) {
                const position = { x, y };
                if (!worm.checkCollision(position, radius)) return position;
            }
        }

        return null;
    }

    private onWormSelfCollision() {
        if (this._gameOver) return;
        const particles: PizzaParticles = this.getObject('PizzaParticles');
        const worm: Worm = this.getObject('Worm');
        particles.emitHeavyBloodBurst({ x: worm.position.x, y: worm.position.y }, Constants.WORM_THICKNESS * 1.35);
        this._gameOver = true;
        worm.enableUpdate = false;
        this.playGameOverSound();

        if (this._restartTimer !== null) {
            clearTimeout(this._restartTimer);
        }

        this._restartTimer = window.setTimeout(() => {
            this.logger.log('Restarting.');
            this.reset();
            this._restartTimer = null;
        }, 10000);
    }

    private playGameOverSound() {
        if (!this.game.isSoundEnabled) return;
        const frequencies = [360, 240, 160];
        frequencies.forEach((frequency, index) => {
            setTimeout(() => {
                this.app.soundLib.playFreq({
                    duration: 0.35,
                    frequency,
                    filterFrequency: frequency * 2,
                    delayTime: 0.08,
                    detune: -15,
                    volume: 0.7,
                    type: 'square'
                });
            }, index * 140);
        });
    }

    private playCoinChipSound() {
        if (!this.game.isSoundEnabled) return;
        const baseFrequencies = [1500, 1200, 1800, 1000, 1500];
        const baseDelays = [0.1, 0.1, 0.1, 0.1, 0.1];
        const baseFilterFrequencies = [1200, 1000, 1400, 800, 1200];
        const baseDetunes = [5, 7, 0, 10, -10];
        baseFrequencies.forEach((freq, index) => {
            const randomFactor = (Math.random() - 0.5) * 0.2;
            const frequency = 500 + freq + freq * randomFactor;
            const delayTime = baseDelays[index] + (Math.random() - 0.5) * 0.05;
            const filterFrequency = baseFilterFrequencies[index] + baseFilterFrequencies[index] * randomFactor;
            const detune = baseDetunes[index] + (Math.random() - 0.5) * 20;
            setTimeout(() => {
                this.app.soundLib.playFreq({
                    duration: 0.5,
                    frequency,
                    filterFrequency,
                    delayTime,
                    detune,
                    volume: 1,
                    type: 'sine'
                });
            }, index * 100);
        });
    }

    private reset() {
        const particles: PizzaParticles = this.getObject('PizzaParticles');
        const worm: Worm = this.getObject('Worm');
        if (this._restartTimer !== null) {
            clearTimeout(this._restartTimer);
            this._restartTimer = null;
        }

        this._score = 0;
        this._totalEatTime = 0;
        this._totalPizzasEaten = 0;
        this._paused = false;
        particles.clear();
        worm.reset();
        this._gameOver = false;
        worm.enableUpdate = true;
        this.placePizza();
    }

    private setPaused(paused: boolean): void {
        if (this._gameOver) return;
        this._paused = paused;
        const worm: Worm = this.getObject('Worm');
        worm.enableUpdate = !paused;

        if (paused) {
            this.app.audioManager.stop('background-music');
            return;
        }

        if (this.game.isMusicEnabled) {
            this.app.audioManager.play('background-music', { repeat: true, volume: 0.7 });
        }
    }

    private getAverageEatingPeriod(): number {
        if (this._totalPizzasEaten === 0) return 0;
        return Math.round(this._totalEatTime / this._totalPizzasEaten);
    }
}
