import { CoreTypes } from "./core.type";
import { InputManager } from "./input-manager";
import { Logger } from "./logger";
import { ResourceManager } from "./resource-manager";
import { Scene } from "./scene";
import { TransitionManager } from "./transition-manager";
import { Camera } from "./camera";

const logger = new Logger('SceneManager');

export class SceneManager<TResourceID extends string, TGameObjectID extends string> {
    private _resourceManager: ResourceManager<TResourceID>;
    private _transitionManager: TransitionManager;
    private _scenes: Map<string, Scene<TResourceID, TGameObjectID>>;
    private _activeSceneId?: string;

    public get activeSceneId() {
        return this._activeSceneId;
    }

    public get activeScene(): Scene<TResourceID, TGameObjectID> | undefined {
        if (!this._activeSceneId) return undefined;
        return this._scenes.get(this._activeSceneId);
    }

    public constructor(resourceManager: ResourceManager<TResourceID>, transitionManager: TransitionManager) {
        this._resourceManager = resourceManager;
        this._transitionManager = transitionManager;
        this._scenes = new Map();
    }

    public register(scene: Scene<TResourceID, TGameObjectID>): void {
        logger.log('Register scene.', scene.id);
        this._scenes.set(scene.id, scene);
    }

    public getScene(sceneId: string): Scene<TResourceID, TGameObjectID> {
        const scene = this._scenes.get(sceneId);
        if (!scene) throw new Error(`Scene not found: ${sceneId}`);
        return scene;
    }

    public switchTo(sceneId: string, transition?: CoreTypes.TSceneTransition): void {
        if (this._activeSceneId === sceneId) return;

        const performSwitch = () => {
            const currentScene = this.activeScene;
            const nextScene = this.getScene(sceneId);
            const previousSceneId = this._activeSceneId;

            if (currentScene) {
                currentScene.exit(sceneId);
            }

            nextScene.ensureInitialized(this._resourceManager);
            nextScene.ensureStarted();
            this._activeSceneId = sceneId;
            nextScene.enter(previousSceneId);
            logger.log('Scene switched.', { previousSceneId, sceneId });
        };

        if (!transition || (transition.durationMs ?? 0) <= 0) {
            performSwitch();
            return;
        }

        this._transitionManager.begin(transition, performSwitch);
    }

    public update(inputManager: InputManager, deltaTime: number): void {
        this._transitionManager.update(deltaTime);
        const scene = this.activeScene;
        if (!scene) return;
        scene.update(inputManager, deltaTime);
    }

    public draw(ctx: CanvasRenderingContext2D, screen: CoreTypes.TSize, camera?: Camera): void {
        const scene = this.activeScene;
        if (scene) {
            scene.draw(ctx, camera);
        }
        this._transitionManager.draw(ctx, screen);
    }

    public destroy(): void {
        const scenes = Array.from(this._scenes.values());
        for (let i = 0; i < scenes.length; i++) {
            scenes[i].destroy();
        }
        this._scenes.clear();
        this._activeSceneId = undefined;
    }
}
