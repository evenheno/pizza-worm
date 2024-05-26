import { BaseRenderer } from "./base-renderer";

export class CanvasRenderer extends BaseRenderer {
    private context: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
    }

    initialize(): void {
        this.context = this.canvas.getContext('2d')!;
    }

    clear(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw(): void {
        // Implement drawing logic
    }
}