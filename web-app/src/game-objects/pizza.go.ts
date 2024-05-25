import { GameApp } from "../game-app";
import { TVector2D } from "../types";

export class Pizza {
    public position: TVector2D;
    public radius: number
    private app: GameApp;
    private gfx: HTMLImageElement;

    constructor(app: GameApp) {
        this.app = app;
        this.position = { x: 0, y: 0 }
        this.gfx = this.app.resourceManager.get("pizza");
    }

    private getRandomPosition(): TVector2D {
        return {
            x: Math.floor(Math.random() * (this.app.screen.width - 2 * this.radius)) + this.radius,
            y: Math.floor(Math.random() * (this.app.screen.height - 2 * this.radius)) + this.radius,
        };
    }

    place(): void {
        // Initialize radius with a random value between 10 and 15
        this.radius = 10 + Math.round(Math.random() * 5);
        let position: TVector2D;
        let hasCollision: boolean;

        // Loop until a valid position without collision is found
        do {
            position = this.getRandomPosition();
            hasCollision = this.app.worm.collidesWith(position, this.radius);
        } while (hasCollision);

        // Set the position once a valid position is found
        this.position = position;
        this.position = position;
    }

    update() {

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
