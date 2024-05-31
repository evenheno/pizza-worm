import { InputManager } from "./input-manager";
import { ResourceManager } from "./resource-manager";
import { SoundLib } from "./sfx-manager";
import { CoreTypes } from "./core.type";
import { Types } from "../pizza-worm/pizza-worm.type";
import { GameObject } from "./game-object";
import { Logger } from "./logger";
import { MidiPlayer, MidiParser } from "../core";

export abstract class GameApp<TResourceID extends string, TGameObjectID extends string> {
    private _lastFrameTime: number = 0;
    private _fps: number = 0;
    private _runtime: number;
    private _frameCount: number = 0;
    private _fpsTime: number = 0;
    private _startTime: number = 0;
    private _inputManager: InputManager;
    private _resourceManager: ResourceManager<TResourceID>;
    private _container: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _screen: CoreTypes.TSize;
    private _soundLib: SoundLib = new SoundLib();
    private _state: CoreTypes.TGameState;
    private _resources?: CoreTypes.TResource<TResourceID>[];
    private _gameObjects: Map<TGameObjectID, GameObject<TResourceID, TGameObjectID>>;
    private _logger: Logger;

    public get fps() { return this._fps }
    public get state() { return this._state; }
    public get screen() { return this._screen }
    public get runtime() { return this._runtime }
    public get soundLib() { return this._soundLib; }
    protected get logger() { return this._logger; }

    public constructor(container: HTMLCanvasElement, resources: CoreTypes.TResource<TResourceID>[]) {
        try {
            if (!container) throw Error('Target container required.');
            this._logger = new Logger('GameApp');
            this._runtime = 0;
            this._resources = resources;
            this._container = container;
            this._resourceManager = new ResourceManager();
            this._inputManager = new InputManager();
            this._state = 'idle';
            this._screen = { width: 1024, height: 768 }
            this._ctx = this._container.getContext("2d")!;
            this._ctx.imageSmoothingEnabled = false;
            this._gameObjects = new Map();
        } catch (error) {
            throw Error(`Failed to initialize application: ${error}`);
        }
    }
    
    public addObject(id: TGameObjectID, gameObject: GameObject<TResourceID, TGameObjectID>) {
        this._logger.log('Adding game object.', id);
        this._gameObjects.set(id, gameObject);
    }

    public removeObject(id: TGameObjectID): void {
        this._logger.log('Removing game object.', id);
        this._gameObjects.delete(id);
    }

    public getObject<T>(id: TGameObjectID): T {
        return this._gameObjects.get(id) as unknown as T;
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

    private _mainLoop(): void {
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
            this._update(this._inputManager);
            this._draw(this._ctx);
            this._runtime = (performance.now() - this._startTime);
            requestAnimationFrame(this._mainLoop.bind(this));
        } catch (error) {
            this.setGameState('crashed')
            const exception = Error(`Runtime Error: ${error}`);
            console.error(exception)
            throw exception;
        }
    }

    private _update(inputManager: InputManager) {
        try {
            const keys = Array.from(this._gameObjects.keys());
            for (const key of keys) {
                const gameObject = this._gameObjects.get(key as TGameObjectID);
                if (gameObject?.enableUpdate) {
                    gameObject.update(inputManager);
                }
            }
            this.onUpdate(inputManager);
        } catch (error) {
            throw new Error(`Failed to update: ${error}`);
        }
    }

    private _draw(ctx: CanvasRenderingContext2D) {
        try {
            const keys = Array.from(this._gameObjects.keys());
            for (const key of keys) {
                const gameObject = this._gameObjects.get(key as TGameObjectID);
                if (gameObject) {
                    gameObject.draw(ctx);
                }
            }
            this.onDraw(ctx);
        } catch (error) {
            throw new Error(`Failed to draw game object: ${error}`);
        }
    }

    private async _start() {
        try {
            this._logger.log('Starting game objects.');
            const keys = Array.from(this._gameObjects.keys());
            for (const key of keys) {
                const gameObject = this._gameObjects.get(key as TGameObjectID);
                if (gameObject) {
                    this._logger.log('Starting game object.', gameObject.id);
                    await gameObject.start();
                }
            }
            this._logger.log('Game objects started.');
        } catch (error) {
            throw new Error(`Failed to start game object: ${error}`);
        }
    }

    private async _initGameObject() {
        const keys = this._gameObjects.keys();
        this._logger.log('Initializing game objects.', keys);
        const gameObjectsArray = Array.from(this._gameObjects.values());
        const promises = gameObjectsArray.map(async (gameObject) => {
            this._logger.log('Initializing game object.', gameObject.id);
            await gameObject.initialize(this._resourceManager);
        });
        await Promise.all(promises);
        this._logger.log('Game objects initialized.');
    }


    private async _initApplication() {
        this._logger.log('Initializing application.');
        this.setGameState('initializing');
        await this.onInitialize(this._resourceManager);
        this._logger.log('Application initialized.');
    }

    private async _initialize() {
        try {
            this._logger.log('Initializing.');
            await this._initApplication();
            await this._initGameObject();
            this._logger.log('Initialization completed.');
        } catch (error) {
            throw Error(`Initialization failed: ${error}`);
        }
    }

    public async start(options?: Types.StartOptions) {
        try {
            this._logger.log('Starting application.', options);
            this.setGameState('loading-res');
            await this.loadResources();
            await this._initialize();
            this._startTime = performance.now();
            this._lastFrameTime = performance.now();
            this.setGameState('ready');
            this._logger.log('Starting main loop.');
            this._mainLoop();
            this._logger.log('Main loop started.');
            this.setGameState('running');
            if (options?.fullScreen) this.fullScreen();
            await this._start();
            await this.onStart(this._resourceManager, this._soundLib);
            this._logger.log('Application started.');
        } catch (error) {
            throw `Failed to start application: ${error}`;
        }
    }

    public setGameState(state: CoreTypes.TGameState) {
        this._state = state;
        this._logger.log('State changed.', state);
    }

    public async loadResources() {
        if (!this._resources?.length) {
            this._logger.log('No resources to load provided, skipping resource load.');
            return;
        }
        this._logger.log(`Loading resources..`);
        this.setGameState('loading-res');
        await this._resourceManager.load(this._resources);
    }

    public fullScreen() {
        this._logger.log('Activating full screen.');
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

    protected abstract onInitialize(resourceManager: ResourceManager<TResourceID>): Promise<void>;
    protected abstract onDraw(ctx: CanvasRenderingContext2D): void;
    protected abstract onUpdate(inputManager: InputManager): void;
    protected abstract onStart(resourceManager: ResourceManager<TResourceID>, soundLib: SoundLib): void;
}
