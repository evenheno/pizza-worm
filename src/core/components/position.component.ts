import { BaseComponent } from "./base-component";
import { TVector2D } from "../../../engix/types";
import { InputManager } from "../input-manager";

export interface IPositionComponent {
    position: TVector2D;
}

export class PositionComponent<T extends string> extends BaseComponent<T> implements IPositionComponent {
    private _position: TVector2D;
    public get position() { return this._position; }

    constructor(position?: TVector2D) {
        super();
        this._position = position;
    }

    public update(input: InputManager): void { }
    public draw(context: CanvasRenderingContext2D): void { }
    public destroy(): void { }
}
