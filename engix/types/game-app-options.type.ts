import { CanvasRenderer, WebGLRenderer } from "../renderers"

export type TGameAppOptions = {
    container: HTMLCanvasElement,
    renderer?: typeof CanvasRenderer | typeof WebGLRenderer
}