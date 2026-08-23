import { CoreTypes } from "./core.type";
import { GameApp } from "./game-app";
import { GameObject } from "./game-object";
import { InputManager } from "./input-manager";
import { ResourceManager } from "./resource-manager";

type TButtonLabel = string | (() => string);

type TButtonPadding = number | {
    x?: number;
    y?: number;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
};

type TButtonStyle = {
    background: string;
    border: string;
    text: string;
    hoverBackground: string;
    hoverBorder: string;
    hoverText: string;
    activeBackground: string;
    activeBorder: string;
    activeText: string;
    disabledBackground: string;
    disabledBorder: string;
    disabledText: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    borderRadius: number;
    borderWidth: number;
};

type TButtonConfig = {
    x: number;
    y: number;
    width?: number;
    height?: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    padding?: TButtonPadding;
    label: TButtonLabel;
    onClick: () => void;
    visible?: () => boolean;
    enabled?: () => boolean;
    pointerSpace?: 'screen' | 'world';
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    borderRadius?: number;
    borderWidth?: number;
    style?: Partial<TButtonStyle>;
};

const DEFAULT_STYLE: TButtonStyle = {
    background: '#1b2230',
    border: '#3d4a66',
    text: '#e6edf8',
    hoverBackground: '#253248',
    hoverBorder: '#5C6B8E',
    hoverText: '#F2F6FF',
    activeBackground: '#2C3B57',
    activeBorder: '#7D90BA',
    activeText: '#FFFFFF',
    disabledBackground: '#161a23',
    disabledBorder: '#2A3244',
    disabledText: '#76809a',
    fontFamily: '"DOSFont"',
    fontSize: 12,
    fontWeight: 'normal',
    borderRadius: 7,
    borderWidth: 2,
};

type TResolvedPadding = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};

type TResolvedBounds = {
    width: number;
    height: number;
};

export class Button<TResourceID extends string, TGameObjectID extends string>
    extends GameObject<TResourceID, TGameObjectID> {

    private static _measureCtx: CanvasRenderingContext2D | null = null;

    private _x: number;
    private _y: number;
    private _width?: number;
    private _height?: number;
    private _minWidth?: number;
    private _maxWidth?: number;
    private _minHeight?: number;
    private _maxHeight?: number;
    private _padding: TResolvedPadding;
    private _label: TButtonLabel;
    private _onClick: () => void;
    private _visible?: () => boolean;
    private _enabled?: () => boolean;
    private _pointerSpace: 'screen' | 'world';
    private _style: TButtonStyle;

    public constructor(
        id: TGameObjectID,
        app: GameApp<TResourceID, TGameObjectID>,
        config: TButtonConfig
    ) {
        super(id, app);
        this._x = config.x;
        this._y = config.y;
        this._width = config.width;
        this._height = config.height;
        this._minWidth = config.minWidth;
        this._maxWidth = config.maxWidth;
        this._minHeight = config.minHeight;
        this._maxHeight = config.maxHeight;
        this._padding = this.resolvePadding(config.padding);
        this._label = config.label;
        this._onClick = config.onClick;
        this._visible = config.visible;
        this._enabled = config.enabled;
        this._pointerSpace = config.pointerSpace || 'screen';
        this._style = {
            ...DEFAULT_STYLE,
            fontSize: config.fontSize !== undefined ? config.fontSize : DEFAULT_STYLE.fontSize,
            fontFamily: config.fontFamily || DEFAULT_STYLE.fontFamily,
            fontWeight: config.fontWeight || DEFAULT_STYLE.fontWeight,
            borderRadius: config.borderRadius !== undefined ? config.borderRadius : DEFAULT_STYLE.borderRadius,
            borderWidth: config.borderWidth !== undefined ? config.borderWidth : DEFAULT_STYLE.borderWidth,
            ...config.style,
        };
    }

    public override initialize(resource: ResourceManager<TResourceID>): void { }
    public override start(): void { }

    public override update(inputManager: InputManager, deltaTime: number): void {
        if (!this.isVisible()) return;
        if (!this.isEnabled()) return;

        const pointer = inputManager.getPointerState();
        if (!pointer.justPressed) return;
        if (!this.containsPointer(pointer)) return;
        this._onClick();
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible()) return;

        const isEnabled = this.isEnabled();
        const hovered = this.isPointerHovering();
        const active = this.isPointerActive(hovered);
        const style = this._style;
        const bounds = this.resolveBounds();

        let background = style.background;
        let border = style.border;
        let textColor = style.text;

        if (!isEnabled) {
            background = style.disabledBackground;
            border = style.disabledBorder;
            textColor = style.disabledText;
        } else if (active) {
            background = style.activeBackground;
            border = style.activeBorder;
            textColor = style.activeText;
        } else if (hovered) {
            background = style.hoverBackground;
            border = style.hoverBorder;
            textColor = style.hoverText;
        }

        this.roundedRect(ctx, this._x, this._y, bounds.width, bounds.height, style.borderRadius, style.borderWidth, background, border);

        const text = this.getLabel();
        ctx.save();
        ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor;
        ctx.fillText(text, this._x + bounds.width / 2, this._y + bounds.height / 2 + 1);
        ctx.restore();
    }

    private isVisible(): boolean {
        return this._visible ? this._visible() : true;
    }

    private isEnabled(): boolean {
        return this._enabled ? this._enabled() : true;
    }

    private isPointerHovering(): boolean {
        const pointer = this.app.inputManager.getPointerState() as CoreTypes.TPointerState | undefined;
        if (!pointer) return false;
        return this.containsPointer(pointer);
    }

    private isPointerActive(hovered: boolean): boolean {
        if (!hovered) return false;
        const pointer = this.app.inputManager.getPointerState() as CoreTypes.TPointerState | undefined;
        if (!pointer) return false;
        return pointer.isDown;
    }

    private containsPoint(x: number, y: number): boolean {
        const bounds = this.resolveBounds();
        const left = this._x;
        const top = this._y;
        const right = this._x + bounds.width;
        const bottom = this._y + bounds.height;

        if (x < left || x > right || y < top || y > bottom) return false;

        const radius = this.getResolvedRadius(bounds.width, bounds.height);
        if (radius <= 0) return true;

        // Inside the center rects (excluding rounded corners).
        if ((x >= left + radius && x <= right - radius) || (y >= top + radius && y <= bottom - radius)) {
            return true;
        }

        // Corner circles.
        const cornerX = x < left + radius ? left + radius : right - radius;
        const cornerY = y < top + radius ? top + radius : bottom - radius;
        const dx = x - cornerX;
        const dy = y - cornerY;
        return (dx * dx) + (dy * dy) <= (radius * radius);
    }

    private getResolvedRadius(width: number, height: number): number {
        return Math.max(0, Math.min(this._style.borderRadius, Math.floor(Math.min(width, height) / 2)));
    }

    private containsPointer(pointer: CoreTypes.TPointerState): boolean {
        if (this._pointerSpace === 'world') {
            return this.containsPoint(pointer.worldX, pointer.worldY);
        }
        return this.containsPoint(pointer.x, pointer.y);
    }

    private getLabel(): string {
        return typeof this._label === 'function' ? this._label() : this._label;
    }

    private resolvePadding(padding?: TButtonPadding): TResolvedPadding {
        if (padding === undefined) {
            return { left: 14, right: 14, top: 8, bottom: 8 };
        }

        if (typeof padding === 'number') {
            const scalar = Math.max(0, padding);
            return { left: scalar, right: scalar, top: scalar, bottom: scalar };
        }

        const x = padding.x !== undefined ? Math.max(0, padding.x) : undefined;
        const y = padding.y !== undefined ? Math.max(0, padding.y) : undefined;
        const left = padding.left !== undefined ? Math.max(0, padding.left) : (x !== undefined ? x : 14);
        const right = padding.right !== undefined ? Math.max(0, padding.right) : (x !== undefined ? x : 14);
        const top = padding.top !== undefined ? Math.max(0, padding.top) : (y !== undefined ? y : 8);
        const bottom = padding.bottom !== undefined ? Math.max(0, padding.bottom) : (y !== undefined ? y : 8);
        return { left, right, top, bottom };
    }

    private resolveBounds(): TResolvedBounds {
        const style = this._style;
        const text = this.getLabel();
        const textMeasure = this.measureText(text, style.fontWeight, style.fontSize, style.fontFamily);
        const fallbackTextHeight = Math.ceil(style.fontSize * 1.2);
        const textHeight = Math.max(fallbackTextHeight, Math.ceil(textMeasure.actualBoundingBoxAscent + textMeasure.actualBoundingBoxDescent));

        const contentWidth = textMeasure.width;
        const autoWidth = contentWidth + this._padding.left + this._padding.right;
        const autoHeight = textHeight + this._padding.top + this._padding.bottom;

        const unclampedWidth = this._width !== undefined ? this._width : autoWidth;
        const unclampedHeight = this._height !== undefined ? this._height : autoHeight;

        const width = this.clamp(unclampedWidth, this._minWidth, this._maxWidth);
        const height = this.clamp(unclampedHeight, this._minHeight, this._maxHeight);

        return {
            width: Math.max(1, Math.round(width)),
            height: Math.max(1, Math.round(height)),
        };
    }

    private clamp(value: number, min?: number, max?: number): number {
        let result = value;
        if (min !== undefined) result = Math.max(min, result);
        if (max !== undefined) result = Math.min(max, result);
        return result;
    }

    private measureText(text: string, fontWeight: string, fontSize: number, fontFamily: string): TextMetrics {
        const ctx = Button.getMeasureContext();
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        return ctx.measureText(text);
    }

    private static getMeasureContext(): CanvasRenderingContext2D {
        if (Button._measureCtx) return Button._measureCtx;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to create button measurement context.');
        }
        Button._measureCtx = ctx;
        return ctx;
    }

    private roundedRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
        borderWidth: number,
        fill: string,
        stroke: string
    ): void {
        const r = this.getResolvedRadius(width, height);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = Math.max(0, borderWidth);
        ctx.stroke();
        ctx.restore();
    }
}
