import { InputManager } from "../../core/input-manager";
import { PizzaWorm } from "../pizza-worm.app";
import { CoreTypes, GameApp } from "../../core";
import { Types } from "../pizza-worm.type";
import { Constants } from "../pizza-worm.const";
import { GameObject } from "../../core/game-object";

export class Worm extends GameObject<Types.ResourceID> {
    private angle: number;
    private length: number;
    private colorIndex: number;
    private turningLeft: boolean;
    private turningRight: boolean;
    private segments: Types.WormSegment[];

    public get position(): CoreTypes.TVector2D {
        const head = this.segments[this.segments.length - 1];
        return { x: head.x, y: head.y };
    }

    constructor(private game: PizzaWorm) {
        super(game);
        this.turningLeft = false;
        this.turningRight = false;
        this.segments = [];
        this.angle = 0;
        this.length = Constants.WORM_INIT_LEN;
        this.colorIndex = 0;
        this.initSegments();
    }

    private initSegments(): void {
        const resolution = this.game.screen;
        for (let i = 0; i < this.length; i++) {
            const segment = this.createSegment(resolution.width / 2, resolution.height / 2);
            this.segments.push(segment);
        }
    }

    private createSegment(x: number, y: number): Types.WormSegment {
        return { x: x, y: y, color: this.getNextColor() };
    }

    private getNextColor(): string {
        const color = Constants.WORM_COLORS[this.colorIndex];
        this.colorIndex = (this.colorIndex + 1) % Constants.WORM_COLORS.length;
        return color;
    }

    update(inputManager: InputManager): void {
        this.turningLeft = inputManager.isTurningLeft();
        this.turningRight = inputManager.isTurningRight();
        this.updateAngle(Constants.TURNING_SPEED);
        this.move();
        this.detectPizzaCollision();
        this.detectSelfCollision();
    }

    public draw(): void {
        const ctx = this.game.ctx;
        this.segments.forEach(segment => {
            ctx.fillStyle = segment.color;
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, Constants.WORM_THICKNESS / 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    public checkCollision(position: CoreTypes.TVector2D, radius: number): boolean {
        return this.segments.some(segment => {
            const distance = Math.hypot(segment.x - position.x, segment.y - position.y);
            return distance < Constants.WORM_THICKNESS / 2 + radius;
        });
    }

    private updateAngle(turningSpeed: number): void {
        this.angle += this.turningLeft ? -turningSpeed : this.turningRight ? turningSpeed : 0;
    }

    private move(): void {
        const screen = this.game.screen;

        for (let i = this.segments.length - 1; i > 0; i--) {
            this.segments[i].x = this.segments[i - 1].x;
            this.segments[i].y = this.segments[i - 1].y;
        }

        const head = this.segments[0];
        head.x += Math.cos(this.angle) * Constants.SPEED;
        head.y += Math.sin(this.angle) * Constants.SPEED;

        this.segments.forEach(segment => {
            segment.x = segment.x < 0 ? screen.width : segment.x >= screen.width ? 0 : segment.x;
            segment.y = segment.y < 0 ? screen.height : segment.y >= screen.height ? 0 : segment.y;
        });
    }

    private detectPizzaCollision(): void {
        const pizzaPos = this.game.pizza.position;
        const pizzaRadius = this.game.pizza.radius;
        const hasCollision = this.checkCollision(pizzaPos, pizzaRadius);
        if (hasCollision) { this.game.onEat(); }
    }

    public grow(size: number): void {
        const lastSegment = this.segments[this.segments.length - 1];
        for (let i = 0; i < size; i++) {
            const segment = this.createSegment(lastSegment.x, lastSegment.y);
            this.segments.push(segment);
        }
    }

    private detectSelfCollision(): void {
        const head = this.segments[0];
        const collisionThreshold = Constants.WORM_THICKNESS / 5;
        const minLenCheck = Math.ceil(collisionThreshold * 2 / Constants.WORM_THICKNESS);
        if (this.segments.length <= minLenCheck) return;
        for (let i = minLenCheck; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const distance = Math.hypot(head.x - segment.x, head.y - segment.y);
            if (distance < collisionThreshold) {
                this.game.gameOver();
                break;
            }
        }
    }
}