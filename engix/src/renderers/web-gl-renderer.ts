import { BaseRenderer } from "./base-renderer";

export class WebGLRenderer extends BaseRenderer {

    private context: WebGLRenderingContext;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

    }

    clear(): void {
        this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
    }

    draw(): void {

    }

    getContext(): WebGLRenderingContext {
        return this.context;
    }

    initialize(): void {
        this.context = this.canvas.getContext('webgl')!;
    }
}