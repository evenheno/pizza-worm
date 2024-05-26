
import { PizzaWorm } from "./pizza-worm/pizza-worm.app";
import { TPizzaWormStartOptions } from "./pizza-worm/pizza-worm.type";
import { Util } from "./pizza-worm/util";

window.PizzaWorm = PizzaWorm;

/*window.start = async (target: HTMLCanvasElement | string, options: TPizzaWormStartOptions) => {
    console.log('Starting pizza worm.');
    const isTargetStr = typeof (target) === 'string';
    const container = isTargetStr ? Util.getElement<HTMLCanvasElement>('canvas') : target;
    if (!container) throw Error('Canvas element container required');

    console.log('Creating game instance.')
    const instance = new PizzaWorm(container);

    console.log('Initializing.');
    await instance.start({ fullScreen: options?.fullScreen });

    container.addEventListener('dblclick', () => {
        instance.fullScreen();
    })

    console.log('Game is running.');
}*/