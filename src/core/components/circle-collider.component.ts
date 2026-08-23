import { CoreTypes } from "../core.type";
import { ColliderComponent, TColliderShape, TRectBounds } from "./collider.component";

export class CircleColliderComponent<TResourceID extends string, TGameObjectID extends string>
    extends ColliderComponent<TResourceID, TGameObjectID> {

    private _getCenter: () => CoreTypes.TVector2D;
    private _getRadius: () => number;

    public constructor(options: {
        getCenter: () => CoreTypes.TVector2D;
        getRadius: () => number;
        enabled?: boolean;
        tag?: string;
        onCollisionEnter?: (other: ColliderComponent<any, any>) => void;
        onCollisionStay?: (other: ColliderComponent<any, any>) => void;
        onCollisionExit?: (other: ColliderComponent<any, any>) => void;
    }) {
        super(options);
        this._getCenter = options.getCenter;
        this._getRadius = options.getRadius;
    }

    public getCenter(): CoreTypes.TVector2D {
        return this._getCenter();
    }

    public getRadius(): number {
        return Math.max(0, this._getRadius());
    }

    public getBounds(): TRectBounds {
        const center = this.getCenter();
        const radius = this.getRadius();
        return {
            x: center.x - radius,
            y: center.y - radius,
            width: radius * 2,
            height: radius * 2,
        };
    }

    public getShape(): TColliderShape {
        return {
            kind: 'circle',
            center: this.getCenter(),
            radius: this.getRadius()
        };
    }
}
