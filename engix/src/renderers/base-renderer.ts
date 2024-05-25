export abstract class BaseRenderer {
  protected canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  abstract initialize(): void;
  abstract clear(): void;
  abstract draw(): void;
}