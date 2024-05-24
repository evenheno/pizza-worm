import { PizzaWormGame } from "./pizza-worm";
import { TPizzaWormStartOptions } from "./types";

window.start = async (container: HTMLCanvasElement, options: TPizzaWormStartOptions) => {
    console.log('Starting pizza worm..');
    const instance = new PizzaWormGame(container);
    await instance.initialize();
    await instance.start({ fullScreen: options?.fullScreen });
    console.log('Pizza worm started.');
}