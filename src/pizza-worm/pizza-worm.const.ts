import { CoreTypes } from "../core";
import { Types } from "./pizza-worm.type";

export namespace Constants {
    export const APP_INFO = {
        title: 'Pizza Worm',
        version: '1.0.0',
        description: 'Arcade snake-like game with scene-based engine architecture.',
        author: 'Or Even Hen',
        license: 'ISC'
    };

    export const DIFFICULTY = 1;
    export const SPEED = 3 * DIFFICULTY;
    export const WORM_COLORS = ["#006400", "#228B22", "#32CD32", "#ADFF2F", "#FFFF00"];
    export const WORM_THICKNESS = 13;
    export const WORM_INIT_LEN = 50;
    export const PIZZA_RADIUS = [20, 60];
    export const TURNING_SPEED = (Math.PI / 36) * DIFFICULTY;
    export const PIZZA_RESOURCE_IDS: Types.ResourceID[] = [
        'pizza-pepperoni',
        'pizza-mushrooms',
        'pizza-pepperoni-jalapeno',
        'pizza-pepperoni-sausage-bacon-ham',
        'pizza-pepperoni-classic',
        'pizza-mushroom',
        'pizza-mushroom-olive-pepper-onion',
        'pizza-pineapple-ham',
        'pizza-four-cheese',
        'pizza-margherita-basil-tomato',
        'pizza-feta-olive-spinach-tomato',
        'pizza-bbq-chicken-red-onion',
    ];

    export const RESOURCES: CoreTypes.TResource<Types.ResourceID>[] = [
        { name: "backdrop", url: "assets/backdrop.gif", type: 'gfx' },
        { name: "pizza-pepperoni", url: "assets/pizza-pepperoni.gif", type: 'gfx' },
        { name: "pizza-mushrooms", url: "assets/pizza-mushrooms.gif", type: 'gfx' },
        { name: "pizza-pepperoni-jalapeno", url: "assets/pizza-pepperoni-jalapeno.png", type: 'gfx' },
        { name: "pizza-pepperoni-sausage-bacon-ham", url: "assets/pizza-pepperoni-sausage-bacon-ham.png", type: 'gfx' },
        { name: "pizza-pepperoni-classic", url: "assets/pizza-pepperoni.png", type: 'gfx' },
        { name: "pizza-mushroom", url: "assets/pizza-mushroom.png", type: 'gfx' },
        { name: "pizza-mushroom-olive-pepper-onion", url: "assets/pizza-mushroom-olive-pepper-onion.png", type: 'gfx' },
        { name: "pizza-pineapple-ham", url: "assets/pizza-pineapple-ham.png", type: 'gfx' },
        { name: "pizza-four-cheese", url: "assets/pizza-four-cheese.png", type: 'gfx' },
        { name: "pizza-margherita-basil-tomato", url: "assets/pizza-margherita-basil-tomato.png", type: 'gfx' },
        { name: "pizza-feta-olive-spinach-tomato", url: "assets/pizza-feta-olive-spinach-tomato.png", type: 'gfx' },
        { name: "pizza-bbq-chicken-red-onion", url: "assets/pizza-bbq-chicken-red-onion.png", type: 'gfx' },
        { name: 'background-music', url: 'assets/background-music.mp3', type: 'sfx' }
    ];
}
