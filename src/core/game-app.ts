import { InputManager } from "./input-manager";
import { ResourceManager } from "./resource-manager";
import { SoundLib } from "./sfx-manager";
import { CoreTypes } from "./core.type";
import { Types } from "../pizza-worm/pizza-worm.type";
import { GameObject } from "./game-object";

export class GameApp<TResourceID extends string> {
    private _lastFrameTime: number = 0;
    private _fps: number = 0;
    private _frameCount: number = 0;
    private _fpsTime: number = 0;
    private _startTime: number = 0;
    private _inputManager: InputManager;
    private _resource: ResourceManager<TResourceID>;
    private _container: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _screen: CoreTypes.TSize;
    private _sndLib: SoundLib = new SoundLib();
    private _state: CoreTypes.TGameState;
    private _resources?: CoreTypes.TResource<TResourceID>[];
    private _runtime: number;
    private _gameObjects: GameObject<TResourceID>[];

    public get fps() { return this._fps }
    public get ctx() { return this._ctx; }
    public get state() { return this._state; }
    public get screen() { return this._screen }
    public get runtime() { return this._runtime }
    public get soundLib() { return this._sndLib; }
    public get inputManager() { return this._inputManager; }
    public get resourceManager() { return this._resource }
    public get gameObjects() { return this._gameObjects }

    public constructor(container: HTMLCanvasElement, resources: CoreTypes.TResource<TResourceID>[]) {
        try {
            if (!container) throw Error('Target container required.');
            this._runtime = 0;
            this._resources = resources;
            this._container = container;
            this._resource = new ResourceManager();
            this._inputManager = new InputManager();
            this._state = 'idle';
            this._screen = { width: 1024, height: 768 }
            this._ctx = this._container.getContext("2d")!;
            this._ctx.imageSmoothingEnabled = false;
        } catch (error) {
            throw Error(`Failed to initialize application: ${error}`);
        }
    }

    public drawGfx(
        image: HTMLImageElement, position: CoreTypes.TVector2D = { x: 0, y: 0 },
        size: CoreTypes.TSize = { width: image.width, height: image.height }) {
        const drawSize: CoreTypes.TSize = size != undefined ? size : { width: image.width, height: image.height };
        this._ctx.drawImage(image, position.x, position.y, drawSize.width, drawSize.height);
    }

    public setGameState(state: CoreTypes.TGameState) {
        this._state = state;
        console.log('State changed', state);
    }

    public async loadResources() {
        if (!this._resources?.length) {
            console.info('No resources to load provided, skipping resource load.');
            return;
        }
        console.log(`Loading resources..`);
        this.setGameState('loading-res');
        await this._resource.load(this._resources);
    }

    public fullScreen() {
        console.log('Activating full-screen.');
        if (!this._container.requestFullscreen) {
            console.warn('Browser does not support full-screen');
            return;
        }
        try {
            this._container.requestFullscreen();
        } catch (error) {
            console.warn(`Failed to set full-screen: ${error}`);
        }
    }

    protected drawOverlay(options?: { alpha?: number, color?: string }) {
        const w = this._screen.width;
        const h = this._screen.height;
        this._ctx.globalAlpha = options?.alpha || 1;
        this._ctx.fillStyle = options?.color || '#000000';
        this._ctx.fillRect(0, 0, w, h);
        this._ctx.globalAlpha = 1;
    }

    protected measureText(text: string) {
        const metrics = this._ctx.measureText(text);
        const ascent = metrics.actualBoundingBoxAscent;
        const descent = metrics.actualBoundingBoxDescent;
        const height = ascent + descent;
        const width = metrics.width;
        return { width, height, ascent, descent };
    }

    protected drawText(
        text: string | string[],
        position: CoreTypes.TComposition,
        options?: {
            offset?: CoreTypes.TVector2DArr,
            fontSize?: number,
            color?: string,
            opacity?: number
        }
    ) {
        const screen = this._screen;
        const fontSize = options?.fontSize || 13;

        this._ctx.globalAlpha = options?.opacity || 1;
        this._ctx.fillStyle = options?.color || '#FFFFFF';
        this._ctx.font = `${fontSize}px "DOSFont"`;

        const lines = Array.isArray(text) ? text : [text];
        const lineHeight = fontSize * 1.2;

        const measure = this.measureText(lines[0]);
        const offset = options?.offset || [0, 0];

        let targetPosition: CoreTypes.TVector2D = { x: 0, y: 0 };

        switch (position) {
            case 'center':
                targetPosition.x = (screen.width / 2) - (measure.width / 2) + offset[0];
                targetPosition.y = (screen.height / 2) - ((lines.length - 1) * lineHeight / 2) + offset[1];
                break;
            case 'bottom-left':
                targetPosition.x = offset[0];
                targetPosition.y = screen.height - measure.descent - offset[1] - (lines.length - 1) * lineHeight;
                break;
            case 'bottom-right':
                targetPosition.x = screen.width - measure.width - offset[0];
                targetPosition.y = screen.height - measure.descent - offset[1] - (lines.length - 1) * lineHeight;
                break;
            case 'top-right':
                targetPosition.x = screen.width - measure.width - offset[0];
                targetPosition.y = measure.ascent + offset[1];
                break;
            case 'top-left':
                targetPosition.x = offset[0];
                targetPosition.y = measure.ascent + offset[1];
                break;
        }

        lines.forEach((line, index) => {
            const yPosition = targetPosition.y + index * lineHeight;
            this._ctx.fillText(line, targetPosition.x, yPosition);
        });

        this._ctx.globalAlpha = 1;
    }

    private updateRuntime() {
        this._runtime = (performance.now() - this._startTime);
    }

    private gameLoop(): void {
        try {
            const now = this.runtime;
            const delta = now - this._lastFrameTime;
            this._lastFrameTime = now;
            this._frameCount++;
            this._fpsTime += delta;
            if (this._fpsTime >= 1000) {
                this._fps = this._frameCount;
                this._frameCount = 0;
                this._fpsTime = 0;
            }
            this.update(this._inputManager);
            this.draw(this._ctx);
            requestAnimationFrame(this.gameLoop.bind(this));
            this.updateRuntime();
        } catch (error) {
            this.setGameState('crashed')
            const exception = Error(`Runtime error: ${error}`);
            console.error(exception)
            throw exception;
        }
    }

    public async start(options?: Types.StartOptions) {
        try {
            console.log('Starting application.', options);
            this.setGameState('loading-res')
            await this.loadResources();
            this.setGameState('initializing');
            try {
                console.log('Initializing.');
                await this.initialize(this.resourceManager);
            } catch (error) {
                throw Error(`Initialization failed: ${error}`);
            }
            this.setGameState('ready');
            this._startTime = performance.now();
            this._lastFrameTime = performance.now();
            this.gameLoop();
            this.setGameState('running')
            if (options?.fullScreen) this.fullScreen();

            console.log('Application started.');
        } catch (error) {
            throw `Failed to start: ${error}`;
        }
    }

    protected initialize(resourceManager: ResourceManager<TResourceID>) {
        this._gameObjects.forEach(go => go.initialize(resourceManager));
    }

    protected update(inputManager: InputManager) {
        this._gameObjects.forEach(go => go.update(this._inputManager));
    }

    protected draw(ctx: CanvasRenderingContext2D) {
        this._gameObjects.forEach(go => go.draw(this._ctx));
    }

}
