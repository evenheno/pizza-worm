import { GameApp } from "../game-app";
import { GameObject } from "../game-object";
import { InputManager } from "../input-manager";

export abstract class BaseComponent<TResID extends string> {
    protected _gameObject?: GameObject<TResID>

    public setContext(gameObject: GameObject<TResID>) {
        this._gameObject = gameObject;
    }

    public abstract update(input: InputManager): void;
    public abstract draw(context: CanvasRenderingContext2D): void;
    public abstract destroy(): void;
}
