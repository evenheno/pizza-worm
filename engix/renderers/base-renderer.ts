export abstract class BaseRenderer {
    protected canvas: HTMLCanvasElement;
  
    constructor(canvas: HTMLCanvasElement) {
      this.canvas = canvas;
    }
  
    abstract clear(): void;
    abstract draw(): void;
    abstract getContext(): CanvasRenderingContext2D | WebGLRenderingContext;
  }