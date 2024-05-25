import { TPizzaWormStartOptions } from "./src/pizza-worm/types";

declare global {
    interface Window {
        start: (target: HTMLCanvasElement | string, options: TPizzaWormStartOptions)=>void;
        fullScreen: ()=>void;
    }
}