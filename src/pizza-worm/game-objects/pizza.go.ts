
import { PizzaWorm } from "../pizza-worm.app";
import { CoreTypes, InputManager, ResourceManager } from '../../core';
import { GameObject } from "../../core/game-object";
import { Types } from "../pizza-worm.type";
import { IPositionComponent, PositionComponent } from "../../core/components/position.component";

export class Pizza extends GameObject<Types.ResourceID> {
    private _radius: number
    private _sprites: HTMLImageElement[];
    private _currentGfx: HTMLImageElement;

    public get position() { return this.getComponent<IPositionComponent>(PositionComponent) }
    public get radius() { return this._radius; }

    public constructor(app: PizzaWorm, position: CoreTypes.TVector2D, radius: number) {
        super(app);
        this._radius = radius;
        this.addComponent(PositionComponent, new PositionComponent(position));
        this.randomPizza();
    }

    public update(inputManager: InputManager): void {

    }

    private randomPizza() {
        this._currentGfx = this._sprites[Math.floor(Math.random() * this._sprites.length)];
    }

    public initialize(resource: ResourceManager<Types.ResourceID>): void {
        this._sprites = [
            resource.get("pizza-pepperoni"),
            resource.get("pizza-mushrooms")
        ];
    }

    public draw(ctx: CanvasRenderingContext2D) {
        const x = this.position. - this._radius;
        const y = this.position.y - this._radius;
        const w = this._radius * 2;
        const h = this._radius * 2;
        ctx.drawImage(this._currentGfx, x, y, w, h);
    }
}