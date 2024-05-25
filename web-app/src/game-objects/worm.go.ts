import { Constants } from "../constants";
import { GameApp } from "../game-app";
import { InputManager } from "../input-manager";
import { TSegment, TVector2D } from "../types";
import { Util } from "../util";

//NOTE TO AI: Use "Util.generateGradientColors"

export class Worm {
    public turningLeft: boolean;
    public turningRight: boolean;

    private segments: TSegment[];
    private angle: number;
    private length: number;
    private colorIndex: number;

    constructor(private app: GameApp) {
        this.turningLeft = false;
        this.turningRight = false;
        this.segments = [];
        this.angle = 0;
        this.length = Constants.WORM_INIT_LEN;
        this.colorIndex = 0;
        this.initializeSegments();
    }

    /**
     * Initialize the worm segments at the center of the screen
     */
    private initializeSegments(): void {
        const screenSize = this.app.screen;
        for (let i = 0; i < this.length; i++) {
            const segment = this.createSegment(screenSize.width / 2, screenSize.height / 2);
            this.segments.push(segment);
        }
    }

    /**
     * Create a segment with specified position and next color
     * @param {number} x - The x-coordinate of the segment
     * @param {number} y - The y-coordinate of the segment
     * @returns {TSegment} - The created segment
     */
    private createSegment(x: number, y: number): TSegment {
        return { x: x, y: y, color: this.getNextColor() };
    }

    /**
     * Retrieve the next color in the sequence and update the color index
     * @returns {string} - The next color
     */
    private getNextColor(): string {
        const color = Constants.WORM_COLORS[this.colorIndex];
        this.colorIndex = (this.colorIndex + 1) % Constants.WORM_COLORS.length;
        return color;
    }

    /**
     * Update the worm's state based on input and game events
     * @param {InputManager} inputManager - The input manager for handling user inputs
     */
    public update(inputManager: InputManager): void {
        this.turningLeft = inputManager.isTurningLeft();
        this.turningRight = inputManager.isTurningRight();
        this.updateAngle(Constants.TURNING_SPEED);
        this.move();
        this.checkCollisionWithPizza();
        this.checkSelfCollision();
    }

    /**
     * Draw the worm on the canvas
     */
    public draw(): void {
        const ctx = this.app.ctx;
        this.segments.forEach(segment => {
            ctx.fillStyle = segment.color;
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, Constants.WORM_THICKNESS / 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /**
     * Check if the worm collides with the given coordinates and radius
     * @param {number} x - The x-coordinate to check
     * @param {number} y - The y-coordinate to check
     * @param {number} radius - The radius to check
     * @returns {boolean} - True if there is a collision, false otherwise
     */
    public collidesWith(position: TVector2D, radius: number): boolean {
        return this.segments.some(segment => {
            const distance = Math.hypot(segment.x - position.x, segment.y - position.y);
            return distance < Constants.WORM_THICKNESS / 2 + radius;
        });
    }

    /**
     * Update the worm's angle based on turning speed and direction
     * @param {number} turningSpeed - The speed at which the worm turns
     */
    private updateAngle(turningSpeed: number): void {
        this.angle += this.turningLeft ? -turningSpeed : this.turningRight ? turningSpeed : 0;
    }

    /**
     * Move the worm and handle screen wrapping
     */
    private move(): void {
        const screen = this.app.screen;

        // Move each segment to the position of the previous segment
        for (let i = this.segments.length - 1; i > 0; i--) {
            this.segments[i].x = this.segments[i - 1].x;
            this.segments[i].y = this.segments[i - 1].y;
        }

        // Calculate the new head position based on the angle and speed
        const head = this.segments[0];
        head.x += Math.cos(this.angle) * Constants.SPEED;
        head.y += Math.sin(this.angle) * Constants.SPEED;

        // Handle boundary conditions for all segments
        this.handleBoundaryConditions(screen);
    }

    /**
     * Handle screen boundary conditions for all segments
     * @param {object} screen - The screen dimensions
     */
    private handleBoundaryConditions(screen: { width: number, height: number }): void {
        this.segments.forEach(segment => {
            segment.x = segment.x < 0 ? screen.width : segment.x >= screen.width ? 0 : segment.x;
            segment.y = segment.y < 0 ? screen.height : segment.y >= screen.height ? 0 : segment.y;
        });
    }

    /**
     * Check if the worm collides with the pizza, and handle the collision event
     */
    private checkCollisionWithPizza(): void {
        const pizzaPos = this.app.pizza.position;
        if (this.collidesWith(pizzaPos, Constants.PIZZA_RADIUS)) {
            const growFactor = Math.floor(Constants.PIZZA_RADIUS / 2);
            this.grow(growFactor);
            this.app.pizza.place();
            this.app.sfx.playCoinChipSound();
            this.app.score += growFactor;
        }
    }

    /**
     * Grow the worm by adding new segments
     * @param {number} size - The number of segments to add
     */
    private grow(size: number): void {
        const lastSegment = this.segments[this.segments.length - 1];
        for (let i = 0; i < size; i++) {
            // Add new segment at the position of the last segment
            this.segments.push(this.createSegment(lastSegment.x, lastSegment.y));
        }
        this.app
    }

    /**
     * Check if the worm collides with itself
     */
    private checkSelfCollision(): void {
        const head = this.segments[0];
        const collisionThreshold = 0.8;

        // Calculate the minimum length to ignore adjacent segments
        const minLengthToCheck = Math.ceil(collisionThreshold * 2 / Constants.WORM_THICKNESS);

        // Only check for collisions if the worm has a minimum length
        if (this.segments.length <= minLengthToCheck) return;

        for (let i = minLengthToCheck; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const distance = Math.hypot(head.x - segment.x, head.y - segment.y);
            if (distance < collisionThreshold) {
                this.app.isGameOver = true;
                break;
            }
        }
    }
}
