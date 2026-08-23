import { InputManager } from "./input-manager";
import { ResourceManager } from "./resource-manager";
import { SoundLib } from "./sfx-manager";
import { CoreTypes } from "./core.type";
import { GameObject } from "./game-object";
import { Logger } from "./logger";
import { TransitionManager } from "./transition-manager";
import { SceneManager } from "./scene-manager";
import { Scene } from "./scene";
import { AudioManager } from "./audio-manager";
import { SpriteManager } from "./sprite-manager";
import { CameraManager } from "./camera-manager";

export type TGameAppStartOptions<TResourceID extends string> = {
    fullScreen?: boolean;
    onResourceLoadProgress?: (progress: CoreTypes.TResourceLoadProgress<TResourceID>) => void;
};

export abstract class GameApp<TResourceID extends string, TGameObjectID extends string> {
    private static readonly FIXED_UPDATE_STEP = 1000 / 60;
    private static readonly MAX_UPDATE_STEPS = 6;
    private _lastFrameTime: number = 0;
    private _updateAccumulator: number = 0;
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
    private _boundMainLoop: () => void;
    private _transitionManager: TransitionManager;
    private _sceneManager: SceneManager<TResourceID, TGameObjectID>;
    private _audioManager: AudioManager<TResourceID>;
    private _spriteManager: SpriteManager<TResourceID>;
    private _cameraManager: CameraManager;
    private _resourceLoadProgress: CoreTypes.TResourceLoadProgress<TResourceID>;
    private _mainLoopStarted: boolean = false;

    public get fps() { return this._fps }
    public get state() { return this._state; }
    public get screen() { return this._screen }
    public get runtime() { return this._runtime }
    public get soundLib() { return this._soundLib; }
    public get inputManager() { return this._inputManager; }
    public get audioManager() { return this._audioManager; }
    public get spriteManager() { return this._spriteManager; }
    public get cameraManager() { return this._cameraManager; }
    public get resourceManager() { return this._resourceManager; }
    public get sceneManager() { return this._sceneManager; }
    public get resourceLoadProgress() { return this._resourceLoadProgress; }
    protected get logger() { return this._logger; }

    public constructor(container: HTMLCanvasElement, resources: CoreTypes.TResource<TResourceID>[]) {
        try {
            if (!container) throw Error('Target container required.');
            this._logger = new Logger('GameApp');
            this._runtime = 0;
            this._resources = resources;
            this._container = container;
            this._resourceManager = new ResourceManager();
            this._state = 'idle';
            this._screen = { width: this._container.width, height: this._container.height }
            this._ctx = this._container.getContext("2d")!;
            this._ctx.imageSmoothingEnabled = false;
            this._inputManager = new InputManager(this._container);
            this._gameObjects = new Map();
            this._boundMainLoop = this._mainLoop.bind(this);
            this._transitionManager = new TransitionManager();
            this._sceneManager = new SceneManager(this._resourceManager, this._transitionManager);
            this._audioManager = new AudioManager(this._soundLib, this._resourceManager);
            this._spriteManager = new SpriteManager(this._resourceManager);
            this._cameraManager = new CameraManager(this._screen);
            this._resourceLoadProgress = {
                loaded: 0,
                total: this._resources.length,
                percentage: 0,
                bytesLoaded: 0,
                bytesTotal: 0,
            };
        } catch (error) {
            throw Error(`Failed to initialize application: ${error}`);
        }
    }

    public registerScene(scene: Scene<TResourceID, TGameObjectID>): void {
        this._sceneManager.register(scene);
    }

    public getScene(sceneId: string): Scene<TResourceID, TGameObjectID> {
        return this._sceneManager.getScene(sceneId);
    }

    public switchScene(sceneId: string, transition?: CoreTypes.TSceneTransition): void {
        this._sceneManager.switchTo(sceneId, transition);
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

    public drawOverlay(options?: { alpha?: number, color?: string }) {
        const w = this._screen.width;
        const h = this._screen.height;
        this._ctx.globalAlpha = options?.alpha || 1;
        this._ctx.fillStyle = options?.color || '#000000';
        this._ctx.fillRect(0, 0, w, h);
        this._ctx.globalAlpha = 1;
    }

    public measureText(text: string) {
        const metrics = this._ctx.measureText(text);
        const ascent = metrics.actualBoundingBoxAscent;
        const descent = metrics.actualBoundingBoxDescent;
        const height = ascent + descent;
        const width = metrics.width;
        return { width, height, ascent, descent };
    }

    public drawText(
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
            const now = performance.now();
            const delta = Math.max(0, Math.min(now - this._lastFrameTime, 100));
            this._lastFrameTime = now;
            this._runtime = now - this._startTime;
            this._frameCount++;
            this._fpsTime += delta;
            if (this._fpsTime >= 1000) {
                this._fps = this._frameCount;
                this._frameCount = 0;
                this._fpsTime = 0;
            }
            this._updateAccumulator += delta;
            let updateSteps = 0;
            while (
                this._updateAccumulator >= GameApp.FIXED_UPDATE_STEP &&
                updateSteps < GameApp.MAX_UPDATE_STEPS
            ) {
                this._update(this._inputManager, GameApp.FIXED_UPDATE_STEP);
                this._updateAccumulator -= GameApp.FIXED_UPDATE_STEP;
                updateSteps++;
            }

            // Drop excess accumulated time after a long stall. This prevents a
            // suspended tab from causing a burst of expensive updates later.
            if (updateSteps === GameApp.MAX_UPDATE_STEPS) {
                this._updateAccumulator = 0;
            }
            this._draw(this._ctx);
            requestAnimationFrame(this._boundMainLoop);
        } catch (error) {
            this.setGameState('crashed')
            const exception = Error(`Runtime Error: ${error}`);
            console.error(exception)
            throw exception;
        }
    }

    private _update(inputManager: InputManager, deltaTime: number) {
        try {
            inputManager.beginFrame(this._cameraManager.getActiveCamera());
            this._sceneManager.update(inputManager, deltaTime);
            if (!this._sceneManager.activeScene) {
                this._gameObjects.forEach((gameObject) => {
                    if (!gameObject.enableUpdate) return;
                    gameObject.update(inputManager, deltaTime);
                });
            }
            this.onUpdate(inputManager, deltaTime);
        } catch (error) {
            throw new Error(`Failed to update: ${error}`);
        }
    }

    private _draw(ctx: CanvasRenderingContext2D) {
        try {
            this._sceneManager.draw(ctx, this._screen, this._cameraManager.getActiveCamera());
            if (!this._sceneManager.activeScene) {
                this._gameObjects.forEach((gameObject) => {
                    gameObject.draw(ctx);
                });
            }
            this.onDraw(ctx);
        } catch (error) {
            throw new Error(`Failed to draw game object: ${error}`);
        }
    }

    private async _start() {
        try {
            this._logger.log('Starting game objects.');
            const gameObjects = Array.from(this._gameObjects.values());
            for (let i = 0; i < gameObjects.length; i++) {
                const gameObject = gameObjects[i];
                this._logger.log('Starting game object.', gameObject.id);
                await gameObject.start();
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

    public async start(options?: TGameAppStartOptions<TResourceID>) {
        try {
            this._logger.log('Starting application.', options);
            await this._initApplication();
            this._startTime = performance.now();
            this._lastFrameTime = performance.now();
            this._updateAccumulator = 0;
            if (!this._mainLoopStarted) {
                this._mainLoopStarted = true;
                this._mainLoop();
            }

            this.setGameState('loading-res');
            await this.loadResources(options?.onResourceLoadProgress);
            await this._initGameObject();
            this.setGameState('ready');
            if (options?.fullScreen) this.fullScreen();
            await this._start();
            await this.onStart(this._resourceManager, this._soundLib);
            this.setGameState('running');
            this._logger.log('Application started.');
        } catch (error) {
            throw new Error(`Failed to start application: ${error}`);
        }
    }

    public setGameState(state: CoreTypes.TGameState) {
        this._state = state;
        this._logger.log('State changed.', state);
    }

    public async loadResources(onProgress?: (progress: CoreTypes.TResourceLoadProgress<TResourceID>) => void) {
        if (!this._resources?.length) {
            this._logger.log('No resources to load provided, skipping resource load.');
            this._resourceLoadProgress = {
                loaded: 0,
                total: 0,
                percentage: 100,
                bytesLoaded: 0,
                bytesTotal: 0,
            };
            return;
        }
        this._logger.log(`Loading resources..`);
        this.setGameState('loading-res');
        await this._resourceManager.load(this._resources, (progress) => {
            this._resourceLoadProgress = progress;
            if (onProgress) onProgress(progress);
        });
    }

    public fullScreen() {
        this._logger.log('Activating full screen.');
        if (!this._container.requestFullscreen) {
            console.warn('Browser does not support full-screen');
            return;
        }
        this._container.requestFullscreen().catch((error) => {
            console.warn(`Failed to set full-screen: ${error}`);
        });
    }

    public destroy() {
        this._sceneManager.destroy();
        this._inputManager.destroy();
    }

    protected abstract onInitialize(resourceManager: ResourceManager<TResourceID>): Promise<void>;
    protected abstract onDraw(ctx: CanvasRenderingContext2D): void;
    protected abstract onUpdate(inputManager: InputManager, deltaTime: number): void;
    protected abstract onStart(resourceManager: ResourceManager<TResourceID>, soundLib: SoundLib): void;
}
