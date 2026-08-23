import { CoreTypes } from "./core.type";

export class Camera {
    private _id: string;
    private _x: number;
    private _y: number;
    private _zoom: number;
    private _rotation: number;

    public get id() { return this._id; }
    public get x() { return this._x; }
    public get y() { return this._y; }
    public get zoom() { return this._zoom; }
    public get rotation() { return this._rotation; }

    public constructor(id: string, initialState?: Partial<CoreTypes.TCameraState>) {
        this._id = id;
        this._x = initialState?.x || 0;
        this._y = initialState?.y || 0;
        this._zoom = initialState?.zoom || 1;
        this._rotation = initialState?.rotation || 0;
    }

    public setPosition(x: number, y: number): void {
        this._x = x;
        this._y = y;
    }

    public translate(deltaX: number, deltaY: number): void {
        this._x += deltaX;
        this._y += deltaY;
    }

    public setZoom(zoom: number): void {
        this._zoom = Math.max(0.05, zoom);
    }

    public setRotation(rotation: number): void {
        this._rotation = rotation;
    }

    public setState(state: Partial<CoreTypes.TCameraState>): void {
        if (state.x !== undefined) this._x = state.x;
        if (state.y !== undefined) this._y = state.y;
        if (state.zoom !== undefined) this.setZoom(state.zoom);
        if (state.rotation !== undefined) this._rotation = state.rotation;
    }

    public begin(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.scale(this._zoom, this._zoom);
        if (this._rotation !== 0) {
            ctx.rotate(this._rotation);
        }
        ctx.translate(-this._x, -this._y);
    }

    public end(ctx: CanvasRenderingContext2D): void {
        ctx.restore();
    }
}
