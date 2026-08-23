import { ResourceManager } from "./resource-manager";
import { SoundLib } from "./sfx-manager";
import { TPlaySfxOptions } from "./sfx-manager.type";

export class AudioManager<TResourceID extends string> {
    private _soundLib: SoundLib;
    private _resourceManager: ResourceManager<TResourceID>;
    private _masterVolume: number = 1;

    public constructor(soundLib: SoundLib, resourceManager: ResourceManager<TResourceID>) {
        this._soundLib = soundLib;
        this._resourceManager = resourceManager;
    }

    public setMasterVolume(volume: number): void {
        this._masterVolume = Math.max(0, Math.min(1, volume));
    }

    public play(trackId: TResourceID, options?: TPlaySfxOptions): HTMLAudioElement {
        const resource = this._resourceManager.get(trackId);
        if (!(resource instanceof HTMLAudioElement)) {
            throw new Error(`Resource is not an audio track: ${trackId}`);
        }

        const baseVolume = options?.volume !== undefined ? options.volume : 1;
        const normalizedVolume = Math.max(0, Math.min(1, baseVolume * this._masterVolume));

        this._soundLib.playSfx(resource, {
            ...options,
            volume: normalizedVolume
        });

        return resource;
    }

    public stop(trackId: TResourceID): void {
        const resource = this._resourceManager.get(trackId);
        if (!(resource instanceof HTMLAudioElement)) {
            throw new Error(`Resource is not an audio track: ${trackId}`);
        }

        resource.pause();
        resource.currentTime = 0;
    }
}
