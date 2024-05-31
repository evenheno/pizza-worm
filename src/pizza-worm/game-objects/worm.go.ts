import { InputManager } from "../../core/input-manager";
import { PizzaWorm } from "../pizza-worm.app";
import { CoreTypes, ResourceManager } from "../../core";
import { Types } from "../pizza-worm.type";
import { Constants } from "../pizza-worm.const";
import { GameObject } from "../../core/game-object";

export class Worm extends GameObject<Types.ResourceID, Types.GameObjectID> {
    private angle: number;
    private length: number;
    private game: PizzaWorm;
    private colorIndex: number;
    private turningLeft: boolean;
    private turningRight: boolean;
    private segments: Types.WormSegment[];

    private onSelfCollision: () => void;

    constructor(game: PizzaWorm, options: {
        onSelfCollision: () => void
    }) {
        super('Worm', game);
        this.game = game;
        this.onSelfCollision = options.onSelfCollision;
        this.reset();
    }

    public get position(): CoreTypes.TVector2D {
        const head = this.segments[this.segments.length - 1];
        return { x: head.x, y: head.y };
    }

    public override initialize(resource: ResourceManager<Types.ResourceID>): void {
        this.logger.log('Initialize.');
    }

    private initSegments(): void {
        const { width, height } = this.screen;
        for (let i = 0; i < this.length; i++) {
            const segmentPosition: CoreTypes.TVector2D = { x: width / 2, y: height / 2 }
            const segment = this.addSegment(segmentPosition);
            this.segments.push(segment);
        }
    }

    private addSegment(position: CoreTypes.TVector2D): Types.WormSegment {
        const segmentColor = Constants.WORM_COLORS[this.colorIndex];
        this.colorIndex = (this.colorIndex + 1) % Constants.WORM_COLORS.length;
        return { x: position.x, y: position.y, color: segmentColor };
    }

    public override start(): void {
        this.logger.log('Start.');
    }

    public override update(inputManager: InputManager): void {
        try {
            this.turningLeft = inputManager.isTurningLeft();
            this.turningRight = inputManager.isTurningRight();
            this.updateAngle(Constants.TURNING_SPEED);
            this.moveForward();
            this.detectSelfCollision();
        } catch (error) {
            throw Error(`Failed to update worm: ${error}}`);
        }
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
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

    public reset() {
        this.segments = [];
        this.turningLeft = false;
        this.turningRight = false;
        this.angle = 0;
        this.length = Constants.WORM_INIT_LEN;
        this.colorIndex = 0;
        this.initSegments();
        this.enableUpdate = true;
    }

    private updateAngle(turningSpeed: number): void {
        this.angle += this.turningLeft ? -turningSpeed : this.turningRight ? turningSpeed : 0;
    }

    private moveForward(): void {
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

    public grow(size: number): void {
        this.logger.log('Growing worm.', size);
        const lastSegment = this.segments[this.segments.length - 1];
        for (let i = 0; i < size; i++) {
            const segmentPosition: CoreTypes.TVector2D = { x: lastSegment.x, y: lastSegment.y }
            const segment = this.addSegment(segmentPosition);
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
                this.onSelfCollision();
                break;
            }
        }
    }
}