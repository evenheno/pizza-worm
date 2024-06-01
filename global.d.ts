import { PizzaWorm } from "./src/pizza-worm/pizza-worm.app";

declare module "*.gif" {
    const value: string;
    export default value;
}

declare module "*.mp3" {
    const value: string;
    export default value;
}

declare global {
    interface Window {
        PizzaWorm: typeof PizzaWorm;
    }
}
