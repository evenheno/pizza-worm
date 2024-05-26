import { PizzaWorm } from "./src/pizza-worm/pizza-worm.app";

declare global {
    interface Window {
        PizzaWorm: typeof PizzaWorm
    }
}