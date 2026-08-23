import { CoreTypes } from "../core.type";
import { InputManager } from "../input-manager";
import { BaseComponent } from "./base-component";

let colliderUid = 0;

export type TCollisionCallbacks = {
    onCollisionEnter?: (other: ColliderComponent<any, any>) => void;
    onCollisionStay?: (other: ColliderComponent<any, any>) => void;
    onCollisionExit?: (other: ColliderComponent<any, any>) => void;
};

export type TRectBounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type TColliderShape =
    | { kind: 'circle'; center: CoreTypes.TVector2D; radius: number; }
    | { kind: 'rect'; rect: TRectBounds; };

export abstract class ColliderComponent<TResourceID extends string, TGameObjectID extends string>
    extends BaseComponent<TResourceID, TGameObjectID> {

    public readonly uid: number;
    public enabled: boolean;
    public readonly tag?: string;

    private _callbacks: TCollisionCallbacks;

    protected constructor(options?: { enabled?: boolean; tag?: string } & TCollisionCallbacks) {
        super();
        this.uid = ++colliderUid;
        this.enabled = options?.enabled !== undefined ? options.enabled : true;
        this.tag = options?.tag;
        this._callbacks = {
            onCollisionEnter: options?.onCollisionEnter,
            onCollisionStay: options?.onCollisionStay,
            onCollisionExit: options?.onCollisionExit,
        };
    }

    public notifyCollisionEnter(other: ColliderComponent<any, any>): void {
        if (!this.enabled) return;
        if (this._callbacks.onCollisionEnter) this._callbacks.onCollisionEnter(other);
    }

    public notifyCollisionStay(other: ColliderComponent<any, any>): void {
        if (!this.enabled) return;
        if (this._callbacks.onCollisionStay) this._callbacks.onCollisionStay(other);
    }

    public notifyCollisionExit(other: ColliderComponent<any, any>): void {
        if (!this.enabled) return;
        if (this._callbacks.onCollisionExit) this._callbacks.onCollisionExit(other);
    }

    public intersects(other: ColliderComponent<any, any>): boolean {
        if (!this.enabled || !other.enabled) return false;
        return ColliderComponent.intersectsShapes(this.getShape(), other.getShape());
    }

    public abstract getShape(): TColliderShape;
    public abstract getBounds(): TRectBounds;

    public update(input: InputManager, deltaTime: number): void { }
    public draw(context: CanvasRenderingContext2D): void { }
    public destroy(): void { }

    protected static circlesIntersect(a: CoreTypes.TVector2D, radiusA: number, b: CoreTypes.TVector2D, radiusB: number): boolean {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const radius = radiusA + radiusB;
        return dx * dx + dy * dy <= radius * radius;
    }

    protected static rectsIntersect(a: TRectBounds, b: TRectBounds): boolean {
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    }

    protected static circleIntersectsRect(center: CoreTypes.TVector2D, radius: number, rect: TRectBounds): boolean {
        const closestX = Math.max(rect.x, Math.min(center.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(center.y, rect.y + rect.height));
        const dx = center.x - closestX;
        const dy = center.y - closestY;
        return dx * dx + dy * dy <= radius * radius;
    }

    private static intersectsShapes(a: TColliderShape, b: TColliderShape): boolean {
        if (a.kind === 'circle' && b.kind === 'circle') {
            return ColliderComponent.circlesIntersect(a.center, a.radius, b.center, b.radius);
        }

        if (a.kind === 'rect' && b.kind === 'rect') {
            return ColliderComponent.rectsIntersect(a.rect, b.rect);
        }

        if (a.kind === 'circle' && b.kind === 'rect') {
            return ColliderComponent.circleIntersectsRect(a.center, a.radius, b.rect);
        }

        if (a.kind === 'rect' && b.kind === 'circle') {
            return ColliderComponent.circleIntersectsRect(b.center, b.radius, a.rect);
        }

        return false;
    }
}
