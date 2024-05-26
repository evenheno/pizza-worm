import { CoreTypes } from "../core";
import { TResourceID } from "./pizza-worm.type";

export namespace Constants {
    export const DIFFICULTY = 1;
    export const SPEED = 3 * DIFFICULTY;
    export const WORM_COLORS = ["#006400", "#228B22", "#32CD32", "#ADFF2F", "#FFFF00"];
    export const WORM_THICKNESS = 13;
    export const WORM_INIT_LEN = 50;
    export const PIZZA_RADIUS = [20, 60];
    export const TURNING_SPEED = (Math.PI / 36) * DIFFICULTY;
    export const RESOURCES: CoreTypes.TResource<TResourceID>[] = [
        { name: "backdrop", src: "assets/backdrop.gif", type: 'Gfx' },
        { name: "pizza-pepperoni", src: "assets/pizza-pepperoni.gif", type: 'Gfx' },
        { name: "pizza-mushrooms", src: "assets/pizza-mushrooms.gif", type: 'Gfx' },
        { name: 'background-music', src: 'assets/background-music.mp3', type: 'Sfx' }
    ];
}