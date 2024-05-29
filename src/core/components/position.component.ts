import { BaseComponent } from "./base-component";
import { InputManager } from "../input-manager";
import { IPositionComponent } from "./position.component.type";
import { CoreTypes } from "../core.type";

export class PositionComponent<T extends string> extends BaseComponent<T> implements IPositionComponent {
    private _position: CoreTypes.TVector2D;
    public get position() { return this._position; }

    constructor(position?: CoreTypes.TVector2D) {
        super();
        this._position = position;
    }

    public update(input: InputManager): void { }
    public draw(context: CanvasRenderingContext2D): void { }
    public destroy(): void { }
}
