import { GameApp, InputManager, ResourceManager, SoundLib } from "../core";
import { Constants } from "./pizza-worm.const";
import { Types } from "./pizza-worm.type";
import { AboutScene, GameplayScene, LoadingScene } from "./scenes";

export class PizzaWorm extends GameApp<Types.ResourceID, Types.GameObjectID> {
    private _soundEnabled: boolean = true;
    private _musicEnabled: boolean = true;

    public get isSoundEnabled() { return this._soundEnabled; }
    public get isMusicEnabled() { return this._musicEnabled; }

    public constructor(container: HTMLCanvasElement) {
        super(container, Constants.RESOURCES);
    }

    public setSoundEnabled(enabled: boolean): void {
        this._soundEnabled = enabled;
    }

    public setMusicEnabled(enabled: boolean): void {
        this._musicEnabled = enabled;
        if (!enabled) {
            this.audioManager.stop('background-music');
            return;
        }
        this.audioManager.play('background-music', { repeat: true, volume: 0.7 });
    }

    protected override async onInitialize(resourceManager: ResourceManager<Types.ResourceID>) {
        this.registerScene(new LoadingScene(this));
        this.registerScene(new GameplayScene(this));
        this.registerScene(new AboutScene(this));
        this.switchScene('loading');
    }

    protected override async onStart(resourceManager: ResourceManager<Types.ResourceID>, soundLib: SoundLib): Promise<void> {
        this.switchScene('gameplay', { durationMs: 450, color: '#000000' });
        this.logger.log('Game engine started.');
    }

    protected override onDraw() { }

    protected override onUpdate(inputManager: InputManager, deltaTime: number) { }
}
