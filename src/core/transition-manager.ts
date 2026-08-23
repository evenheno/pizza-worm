import { CoreTypes } from "./core.type";

export class TransitionManager {
    private static readonly DEFAULT_DURATION_MS = 500;
    private static readonly DEFAULT_COLOR = '#000000';

    private _state: CoreTypes.TTransitionState = 'idle';
    private _elapsedMs: number = 0;
    private _durationMs: number = TransitionManager.DEFAULT_DURATION_MS;
    private _color: string = TransitionManager.DEFAULT_COLOR;
    private _midpointAction?: () => void;

    public get isRunning() {
        return this._state !== 'idle';
    }

    public begin(options?: CoreTypes.TSceneTransition, midpointAction?: () => void): void {
        const configuredDuration = options?.durationMs ?? TransitionManager.DEFAULT_DURATION_MS;
        this._durationMs = Math.max(0, configuredDuration);
        this._color = options?.color || TransitionManager.DEFAULT_COLOR;
        this._elapsedMs = 0;
        this._midpointAction = midpointAction;

        if (this._durationMs === 0) {
            if (this._midpointAction) this._midpointAction();
            this._midpointAction = undefined;
            this._state = 'idle';
            return;
        }

        this._state = 'fade-out';
    }

    public update(deltaMs: number): void {
        if (this._state === 'idle') return;
        this._elapsedMs += deltaMs;

        const halfDuration = this._durationMs / 2;
        if (this._state === 'fade-out' && this._elapsedMs >= halfDuration) {
            this._elapsedMs = 0;
            if (this._midpointAction) {
                this._midpointAction();
                this._midpointAction = undefined;
            }
            this._state = 'fade-in';
            return;
        }

        if (this._state === 'fade-in' && this._elapsedMs >= halfDuration) {
            this._elapsedMs = 0;
            this._state = 'idle';
        }
    }

    public draw(ctx: CanvasRenderingContext2D, screen: CoreTypes.TSize): void {
        if (this._state === 'idle') return;

        const halfDuration = Math.max(1, this._durationMs / 2);
        const phaseProgress = Math.min(1, this._elapsedMs / halfDuration);
        const alpha = this._state === 'fade-out' ? phaseProgress : 1 - phaseProgress;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this._color;
        ctx.fillRect(0, 0, screen.width, screen.height);
        ctx.restore();
    }
}
