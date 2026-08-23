import { ColliderComponent, TColliderShape, TRectBounds } from "./collider.component";

export class RectColliderComponent<TResourceID extends string, TGameObjectID extends string>
    extends ColliderComponent<TResourceID, TGameObjectID> {

    private _getRectBounds: () => TRectBounds;

    public constructor(options: {
        getRectBounds: () => TRectBounds;
        enabled?: boolean;
        tag?: string;
        onCollisionEnter?: (other: ColliderComponent<any, any>) => void;
        onCollisionStay?: (other: ColliderComponent<any, any>) => void;
        onCollisionExit?: (other: ColliderComponent<any, any>) => void;
    }) {
        super(options);
        this._getRectBounds = options.getRectBounds;
    }

    public getRectBounds(): TRectBounds {
        return this._getRectBounds();
    }

    public getBounds(): TRectBounds {
        return this.getRectBounds();
    }

    public getShape(): TColliderShape {
        return {
            kind: 'rect',
            rect: this.getRectBounds()
        };
    }
}
