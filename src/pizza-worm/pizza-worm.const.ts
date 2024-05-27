import { CoreTypes } from "../core";
import { Types } from "./pizza-worm.type";

export namespace Constants {
    export const DIFFICULTY = 1;
    export const SPEED = 3 * DIFFICULTY;
    export const WORM_COLORS = ["#006400", "#228B22", "#32CD32", "#ADFF2F", "#FFFF00"];
    export const WORM_THICKNESS = 13;
    export const WORM_INIT_LEN = 50;
    export const PIZZA_RADIUS = [20, 60];
    export const TURNING_SPEED = (Math.PI / 36) * DIFFICULTY;
    export const RESOURCES: CoreTypes.TResource<Types.ResourceID>[] = [
        { name: "backdrop", url: "assets/backdrop.gif", type: 'gfx' },
        { name: "pizza-pepperoni", url: "assets/pizza-pepperoni.gif", type: 'gfx' },
        { name: "pizza-mushrooms", url: "assets/pizza-mushrooms.gif", type: 'gfx' },
        { name: 'background-music', url: 'assets/background-music.mp3', type: 'sfx' }
    ];
}