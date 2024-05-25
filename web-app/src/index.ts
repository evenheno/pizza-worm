import { GameApp } from "./game-app";
import { TPizzaWormStartOptions } from "./types";
import { Util } from "./util";

window.start = async (target: HTMLCanvasElement | string, options: TPizzaWormStartOptions) => {
    console.log('Starting pizza worm.');
    const isTargetStr = typeof (target) === 'string';
    const container = isTargetStr ? Util.getElement<HTMLCanvasElement>('canvas') : target;
    if (!container) throw Error('Canvas element container required');

    console.log('Creating game instance.')
    const instance = new GameApp(container);

    console.log('Initializing.');
    await instance.initialize();
    await instance.start({ fullScreen: options?.fullScreen });
    console.log('Game is running.');
}

