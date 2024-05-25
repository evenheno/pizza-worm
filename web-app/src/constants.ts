import { TResourceID } from "./game-app";
import { TResource } from "./types";

export namespace Constants {
    export const SPEED = 1;
    export const WORM_COLORS = ["#006400", "#228B22", "#32CD32", "#ADFF2F", "#FFFF00"];
    export const WORM_THICKNESS = 4;
    export const WORM_INIT_LEN = 20;
    export const PIZZA_RADIUS = 15;
    export const TURNING_SPEED = Math.PI / 36;
    export const RESOURCES: TResource<TResourceID>[] = [
        { name: "backdrop", src: "assets/backdrop.gif" },
        { name: "pizza", src: "assets/pizza.png" },
    ];
}