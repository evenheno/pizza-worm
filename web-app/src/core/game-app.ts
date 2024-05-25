import { InputManager } from "./input-manager";
import { ResourceManager } from "./resource-manager";
import { TPizzaWormStartOptions, TSize, TVector2D, TComposition, TGameState, TResource, TVector2DArr } from "../pizza-worm/types";
import { SFX } from "./sfx";

export class GameApp<TResourceID extends string> {
    private _input: InputManager;
    private _resource: ResourceManager<TResourceID>;
    private _container: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _screen: TSize;
    private _sfx: SFX = new SFX();
    private _state: TGameState;
    private _resources: TResource<TResourceID>[];
    private _lastFrameTime: number = 0;
    private _fps: number = 0;
    private _frameCount: number = 0;
    private _fpsTime: number = 0;
    private _startTime: number = 0; // New variable to store the start time

    public get resource() { return this._resource }
    public get ctx() { return this._ctx; }
    public get sfx() { return this._sfx; }
    public get input() { return this._input; }
    public get screen() { return this._screen }
    public get fps() { return this._fps }
    public get runtime() { return performance.now() - this._startTime; } // New getter to calculate runtime

    public get state() {
        return this._state;
    }

    public constructor(container: HTMLCanvasElement, resources: TResource<TResourceID>[]) {
        try {
            this._resources = resources;
            this._container = container;
            this._resource = new ResourceManager();
            this._input = new InputManager();
            this._state = 'Idle';
            this._screen = { width: 1024, height: 768 }
            this._ctx = this._container.getContext("2d")!;
            this._ctx.imageSmoothingEnabled = false;
        } catch (error) {
            throw Error(`Failed to initialize game app: ${error}`);
        }
    }

    public drawGfx(image: HTMLImageElement, position: TVector2D = { x: 0, y: 0 }, size: TSize = { width: image.width, height: image.height }) {
        const drawSize: TSize = size != undefined ? size : { width: image.width, height: image.height };
        this._ctx.drawImage(image, position.x, position.y, drawSize.width, drawSize.height);
    }

    public setGameState(state: TGameState) {
        this._state = state;
        console.log(`Game state changed: "${state}"`);
    }

    public async loadResources() {
        console.log(`Loading resources..`);
        this.setGameState('LoadingRes');
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
        this._ctx.globalAlpha = options?.alpha || 1;
        this._ctx.fillStyle = options?.color || '#000000';
        const w = this._screen.width;
        const h = this._screen.height;
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
        position: TComposition,
        options?: {
            offset?: TVector2DArr,
            fontSize?: number,
            color?: string,
            opacity?: number
        }
    ) {
        const { width: screenWidth, height: screenHeight } = this._screen;
        const fontSize = options?.fontSize || 13;

        this._ctx.globalAlpha = options?.opacity || 1;
        this._ctx.fillStyle = options?.color || '#FFFFFF';
        this._ctx.font = `${fontSize}px "DOSFont"`;

        const lines = Array.isArray(text) ? text : [text];
        const lineHeight = fontSize * 1.2; // Adjust line height as needed

        const measure = this.measureText(lines[0]); // Measure the first line
        const offset = options?.offset || [0, 0];

        let targetPosition: TVector2D = { x: 0, y: 0 };

        switch (position) {
            case 'Center':
                targetPosition.x = (screenWidth / 2) - (measure.width / 2) + offset[0];
                targetPosition.y = (screenHeight / 2) - ((lines.length - 1) * lineHeight / 2) + offset[1];
                break;
            case 'BottomLeft':
                targetPosition.x = offset[0];
                targetPosition.y = screenHeight - measure.descent - offset[1] - (lines.length - 1) * lineHeight;
                break;
            case 'BottomRight':
                targetPosition.x = screenWidth - measure.width - offset[0];
                targetPosition.y = screenHeight - measure.descent - offset[1] - (lines.length - 1) * lineHeight;
                break;
            case 'TopRight':
                targetPosition.x = screenWidth - measure.width + offset[0];
                targetPosition.y = measure.ascent + offset[1];
                break;
            case 'TopLeft':
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

    private animation(): void {
        try {
            const now = performance.now();
            const delta = now - this._lastFrameTime;
            this._lastFrameTime = now;
            this._frameCount++;
            this._fpsTime += delta;
            if (this._fpsTime >= 1000) {
                this._fps = this._frameCount;
                this._frameCount = 0;
                this._fpsTime = 0;
            }

            this.update();
            this.draw();

            requestAnimationFrame(this.animation.bind(this));
        } catch (error) {
            this.setGameState('Crashed')
            const exception = Error(`Runtime error: ${error}`);
            console.error(exception)
            throw exception;
        }
    }

    public async start(options?: TPizzaWormStartOptions) {
        try {
            this.setGameState('LoadingRes')
            await this.loadResources();
            this.setGameState('Initializing');
            try {
                await this.initialize();
            } catch (error) {
                throw Error(`Initialization failed: ${error}`);
            }
            this.setGameState('Ready');
            this._startTime = performance.now(); // Set the start time here
            this._lastFrameTime = performance.now();
            this.animation();
            this.setGameState('Running')
            if (options?.fullScreen) this.fullScreen();
        } catch (error) {
            throw `Failed to start: ${error}`;
        }
    }

    protected initialize() { }
    protected update() { }
    protected draw() { }
}
