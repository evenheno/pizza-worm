
import { PizzaWorm } from "../pizza-worm.app";
import { CoreTypes, IPositionComponent, InputManager, ResourceManager, GameObject } from '../../core';
import { Types } from "../pizza-worm.type";
import { PositionComponent } from "../../core/components/position.component";

export class Pizza extends GameObject<Types.ResourceID> {
    private _radius: number
    private _sprites: HTMLImageElement[];
    private _currentGfx: HTMLImageElement;

    public get positionComp() { return this.getComponent<IPositionComponent>(PositionComponent) }
    public get position() { return this.positionComp.position }
    public get radius() { return this._radius; }

    public constructor(app: PizzaWorm, position: CoreTypes.TVector2D, radius: number) {
        try {
            console.group('[Pizza]: Constructor');
            super(app);
            this._radius = radius;
            console.log('Adding position component.');
            this.addComponent(PositionComponent, new PositionComponent(position));
        } catch (error) {
            throw Error(`[Pizza]: Failed to initialize class: ${error}`);
        }
    }

    public override initialize(res: ResourceManager<Types.ResourceID>): void {
        console.group('[Pizza]: Initializing..');
        this._sprites = [res.get("pizza-pepperoni"), res.get("pizza-mushrooms")];
        this.randomPizza();
    }

    public override update(inputManager: InputManager): void { }

    private randomPizza() {
        console.log('[Pizza]: Selecting random sprite..');
        this._currentGfx = this._sprites[Math.floor(Math.random() * this._sprites.length)];
    }

    public override draw(ctx: CanvasRenderingContext2D) {
        const x = this.position.x - this._radius;
        const y = this.position.y - this._radius;
        const w = this._radius * 2;
        const h = this._radius * 2;
        ctx.drawImage(this._currentGfx, x, y, w, h);
    }
}