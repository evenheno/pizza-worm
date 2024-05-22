import { PizzaWorm } from "./pizza-worm";
const pizzaWorm = new PizzaWorm.Game();
pizzaWorm.start();

(window as any).fsc = () => {
    pizzaWorm.fullScreen();
}