
import { PizzaWorm } from "../pizza-worm.app";
import { TVector2D } from "../types";

export class Pizza {
    public position: TVector2D;
    public radius: number
    private app: PizzaWorm;
    private gfx: HTMLImageElement;

    constructor(game: PizzaWorm, position: TVector2D, radius: number) {
        this.app = game;
        this.radius = radius;
        this.position = position;
        this.gfx = this.app.resource.get("pizza");
    }

    draw() {
        const ctx = this.app.ctx;
        const x = this.position.x - this.radius;
        const y = this.position.y - this.radius;
        const w = this.radius * 2;
        const h = this.radius * 2;
        ctx.drawImage(this.gfx, x, y, w, h);
    }
}
