import { CoreTypes } from "./core.type";
import { GameApp } from "./game-app";
import { GameObject } from "./game-object";
import { InputManager } from "./input-manager";
import { ResourceManager } from "./resource-manager";

type TTextContent = string | string[] | (() => string | string[]);

type TTextConfig = {
    content: TTextContent;
    position: CoreTypes.TComposition;
    options?: {
        offset?: CoreTypes.TVector2DArr;
        fontSize?: number;
        color?: string;
        opacity?: number;
    };
    visible?: () => boolean;
};

export class Text<TResourceID extends string, TGameObjectID extends string>
    extends GameObject<TResourceID, TGameObjectID> {

    private _content: TTextContent;
    private _position: CoreTypes.TComposition;
    private _options?: TTextConfig['options'];
    private _visible?: () => boolean;

    public constructor(
        id: TGameObjectID,
        app: GameApp<TResourceID, TGameObjectID>,
        config: TTextConfig
    ) {
        super(id, app);
        this._content = config.content;
        this._position = config.position;
        this._options = config.options;
        this._visible = config.visible;
    }

    public setContent(content: TTextContent): void {
        this._content = content;
    }

    public override initialize(resource: ResourceManager<TResourceID>): void { }
    public override start(): void { }
    public override update(inputManager: InputManager, deltaTime: number): void { }

    public override draw(context: CanvasRenderingContext2D): void {
        if (this._visible && !this._visible()) return;
        const value = typeof this._content === 'function' ? this._content() : this._content;
        this.app.drawText(value, this._position, this._options);
    }
}
