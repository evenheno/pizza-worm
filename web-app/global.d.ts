import { TPizzaWormStartOptions } from "./types";

declare global {
    interface Window {
        start: (target: HTMLCanvasElement | string, options: TPizzaWormStartOptions)=>void;
    }
}