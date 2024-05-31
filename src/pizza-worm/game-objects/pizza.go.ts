
import { Types } from "../pizza-worm.type";
import { PizzaWorm } from "../pizza-worm.app";
import { CoreTypes, InputManager, ResourceManager, GameObject } from '../../core';

export class Pizza extends GameObject<Types.ResourceID, Types.GameObjectID> {
    private _pizzaSprites: HTMLImageElement[];
    private _currentGfx: HTMLImageElement;

    public radius: number
    public position: CoreTypes.TVector2D;

    public constructor(app: PizzaWorm) {
        super('Pizza', app);
    }

    private replaceSprite() {
        this._currentGfx = this._pizzaSprites[Math.floor(Math.random() * this._pizzaSprites.length)];
    }

    public override initialize(resource: ResourceManager<Types.ResourceID>): void {
        this._pizzaSprites = [
            resource.get("pizza-pepperoni"),
            resource.get("pizza-mushrooms")
        ];
        this.replaceSprite();
    }

    public override update(inputManager: InputManager): void { }
    public override start(): void { }

    public override draw(ctx: CanvasRenderingContext2D) {
        const x = this.position.x - this.radius;
        const y = this.position.y - this.radius;
        const w = this.radius * 2;
        const h = this.radius * 2;
        ctx.drawImage(this._currentGfx, x, y, w, h);
    }
}