import { InputManager } from "../../core/input-manager";
import { PizzaWorm } from "../pizza-worm.app";
import { CoreTypes, GameApp, ResourceManager } from "../../core";
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
    private game: PizzaWorm;

    public get position(): CoreTypes.TVector2D {
        if (!this.segments) return { x: 0, y: 0 }
        const head = this.segments[this.segments.length - 1];
        return { x: head.x, y: head.y };
    }

    constructor(game: PizzaWorm) {
        super(game);
        this.segments = [];
        this.game = game;
        this.turningLeft = false;
        this.turningRight = false;
        this.angle = 0;
        this.length = Constants.WORM_INIT_LEN;
        this.colorIndex = 0;
    }

    public override initialize(resource: ResourceManager<Types.ResourceID>): void {
        console.group('Initializing worm object.');
        this.initSegments();
    }

    private initSegments(): void {
        console.log('Initiating segment.')
        const { width, height } = this.screen;
        for (let i = 0; i < this.length; i++) {
            const segmentPosition: CoreTypes.TVector2D = { x: width / 2, y: height / 2 }
            const segment = this.createSegment(segmentPosition);
            this.segments.push(segment);
        }
    }

    private createSegment(position: CoreTypes.TVector2D): Types.WormSegment {
        return { x: position.x, y: position.y, color: this.nextSegmentColor() };
    }

    private nextSegmentColor(): string {
        const color = Constants.WORM_COLORS[this.colorIndex];
        this.colorIndex = (this.colorIndex + 1) % Constants.WORM_COLORS.length;
        return color;
    }

    public update(inputManager: InputManager): void {
        try {
            this.turningLeft = inputManager.isTurningLeft();
            this.turningRight = inputManager.isTurningRight();
            this.updateAngle(Constants.TURNING_SPEED);
            this.move();
            this.detectPizzaCollision();
            this.detectSelfCollision();
        } catch (error) {
            throw Error(`Failed to update worm: ${error}}`);
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
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
        for (let i = this.segments.length - 1; i > 0; i--) {
            this.segments[i].x = this.segments[i - 1].x;
            this.segments[i].y = this.segments[i - 1].y;
        }

        const head = this.segments[0];
        head.x += Math.cos(this.angle) * Constants.SPEED;
        head.y += Math.sin(this.angle) * Constants.SPEED;

        this.segments.forEach(segment => {
            segment.x = segment.x < 0 ? this.screen.width : segment.x >= this.screen.width ? 0 : segment.x;
            segment.y = segment.y < 0 ? this.screen.height : segment.y >= this.screen.height ? 0 : segment.y;
        });
    }

    private detectPizzaCollision(): void {
        const pizza = this.game.pizza;
        const pizzaPos = pizza.position;
        const pizzaRadius = pizza.radius;
        const hasCollision = this.checkCollision(pizzaPos, pizzaRadius);
        if (hasCollision) { this.game.onEat(); }
    }

    public grow(size: number): void {
        const lastSegment = this.segments[this.segments.length - 1];
        for (let i = 0; i < size; i++) {
            const segmentPosition: CoreTypes.TVector2D = { x: lastSegment.x, y: lastSegment.y }
            const segment = this.createSegment(segmentPosition);
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