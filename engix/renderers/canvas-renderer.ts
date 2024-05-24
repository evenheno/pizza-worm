import { BaseRenderer } from "./base-renderer";

export class CanvasRenderer extends BaseRenderer {
    private context: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.context = canvas.getContext('2d')!;
    }

    clear(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw(): void {
        // Implement drawing logic
    }

    getContext(): CanvasRenderingContext2D {
        return this.context;
    }
}