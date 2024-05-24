import { TPizzaWormStartOptions } from "./types";

declare global {
    interface Window {
        start: (container: HTMLCanvasElement, options: TPizzaWormStartOptions) => Promise<void>;
    }
}