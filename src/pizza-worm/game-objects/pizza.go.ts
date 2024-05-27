
import { PizzaWorm } from "../pizza-worm.app";
import { CoreTypes } from '../../core';

export class Pizza {
    private _position: CoreTypes.TVector2D;
    private _radius: number
    private app: PizzaWorm;
    private gfx: HTMLImageElement[];
    private currentGfx: HTMLImageElement;

    public get radius() { return this._radius; }
    public get position() { return this._position; }

    constructor(game: PizzaWorm, position: CoreTypes.TVector2D, radius: number) {
        this.app = game;
        this._radius = radius;
        this._position = position;
        this.gfx = [
            this.app.resource.get("pizza-pepperoni"),
            this.app.resource.get("pizza-mushrooms")
        ];
        this.currentGfx = this.gfx[Math.floor(Math.random() * this.gfx.length)];
    }

    draw() {
        const ctx = this.app.ctx;
        const x = this._position.x - this._radius;
        const y = this._position.y - this._radius;
        const w = this._radius * 2;
        const h = this._radius * 2;

        ctx.drawImage(this.currentGfx, x, y, w, h);
    }
}
