import { InputManager } from "../../core/input-manager";
import { PizzaWorm } from "../pizza-worm.app";
import { CoreTypes, ResourceManager } from "../../core";
import { Types } from "../pizza-worm.type";
import { Constants } from "../pizza-worm.const";
import { GameObject } from "../../core/game-object";

export class Worm extends GameObject<Types.ResourceID, Types.GameObjectID> {
    private angle!: number;
    private length!: number;
    private game: PizzaWorm;
    private colorIndex!: number;
    private turningLeft!: boolean;
    private turningRight!: boolean;
    private segments!: Types.WormSegment[];

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
        const head = this.segments[0];
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

    public override update(inputManager: InputManager, deltaTime: number): void {
        try {
            const frameScale = deltaTime / (1000 / 60);
            this.turningLeft = inputManager.isTurningLeft();
            this.turningRight = inputManager.isTurningRight();
            this.updateAngle(Constants.TURNING_SPEED * frameScale);
            this.moveForward(frameScale);
            this.detectSelfCollision();
        } catch (error) {
            throw Error(`Failed to update worm: ${error}}`);
        }
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        const colors = Constants.WORM_COLORS;
        const colorCount = colors.length;
        const radius = Constants.WORM_THICKNESS / 2;

        // The segment colors are assigned in a repeating cycle. Drawing one
        // path per color avoids changing canvas state and filling once per
        // segment.
        for (let colorIndex = 0; colorIndex < colorCount; colorIndex++) {
            ctx.fillStyle = colors[colorIndex];
            ctx.beginPath();
            for (let segmentIndex = colorIndex; segmentIndex < this.segments.length; segmentIndex += colorCount) {
                const segment = this.segments[segmentIndex];
                ctx.moveTo(segment.x + radius, segment.y);
                ctx.arc(segment.x, segment.y, radius, 0, Math.PI * 2);
            }
            ctx.fill();
        }
    }

    public checkCollision(position: CoreTypes.TVector2D, radius: number): boolean {
        const collisionRadius = Constants.WORM_THICKNESS / 2 + radius;
        const collisionRadiusSquared = collisionRadius * collisionRadius;
        return this.segments.some(segment =>
            this.getWrappedDistanceSquared(segment, position) < collisionRadiusSquared
        );
    }

    public checkHeadCollision(position: CoreTypes.TVector2D, radius: number): boolean {
        const head = this.segments[0];
        const collisionRadius = Constants.WORM_THICKNESS / 2 + radius;
        return this.getWrappedDistanceSquared(head, position) < collisionRadius * collisionRadius;
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

    private moveForward(frameScale: number): void {
        for (let i = this.segments.length - 1; i > 0; i--) {
            this.segments[i].x = this.segments[i - 1].x;
            this.segments[i].y = this.segments[i - 1].y;
        }

        const head = this.segments[0];
        head.x += Math.cos(this.angle) * Constants.SPEED * frameScale;
        head.y += Math.sin(this.angle) * Constants.SPEED * frameScale;

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
        const collisionThresholdSquared = collisionThreshold * collisionThreshold;
        const minLenCheck = Math.ceil(Constants.WORM_THICKNESS / Constants.SPEED) + 2;
        if (this.segments.length <= minLenCheck) return;
        for (let i = minLenCheck; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (this.getWrappedDistanceSquared(head, segment) < collisionThresholdSquared) {
                this.onSelfCollision();
                break;
            }
        }
    }

    private getWrappedDistanceSquared(a: CoreTypes.TVector2D, b: CoreTypes.TVector2D): number {
        const width = this.screen.width;
        const height = this.screen.height;
        const rawXDistance = Math.abs(a.x - b.x);
        const rawYDistance = Math.abs(a.y - b.y);
        const xDistance = width > 0 ? Math.min(rawXDistance, width - rawXDistance) : rawXDistance;
        const yDistance = height > 0 ? Math.min(rawYDistance, height - rawYDistance) : rawYDistance;
        return xDistance * xDistance + yDistance * yDistance;
    }
}
