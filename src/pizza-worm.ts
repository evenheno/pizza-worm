import { GameObjects } from "./game-objects.ns";
import { InputManager } from "./input-manager";
import { ResourceManager } from "./resource-manager";

export namespace PizzaWorm {
    const WORM_COLORS = ["#006400", "#228B22", "#32CD32", "#ADFF2F", "#FFFF00"];
    const WORM_THICKNESS = 5;
    const SPEED = 1;
    const PIZZA_RADIUS = 15;
    const TURNING_SPEED = Math.PI / 36;

    export class Game {
        private wormLength = 40;
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;
        private score: number = 0;

        private resourceManager: ResourceManager = new ResourceManager();
        private inputManager: InputManager = new InputManager();
        private worm: GameObjects.Worm;
        private pizza: GameObjects.Pizza;

        public constructor() {
            this.init();
        }

        public fullScreen() {
            if (!this.canvas.requestFullscreen) return;
            this.canvas.requestFullscreen();
        }

        private initVars(): void {
            this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
            this.ctx = this.canvas.getContext("2d")!;
            this.ctx.imageSmoothingEnabled = false;

            this.worm = new GameObjects.Worm(
                this.canvas.width,
                this.canvas.height,
                this.wormLength,
                WORM_THICKNESS,
                SPEED,
                WORM_COLORS
            );
            this.pizza = new GameObjects.Pizza(PIZZA_RADIUS);
        }

        private update(): void {
            if (!this.worm || !this.pizza || !this.canvas) return;

            this.worm.turningLeft = this.inputManager.isTurningLeft();
            this.worm.turningRight = this.inputManager.isTurningRight();
            this.worm.updateAngle(TURNING_SPEED);
            this.worm.move(this.canvas.width, this.canvas.height);
            this.worm.trim();
            if (
                this.worm.collidesWith(
                    this.pizza.position!.x,
                    this.pizza.position!.y,
                    PIZZA_RADIUS
                )
            ) {
                this.wormLength += Math.floor(PIZZA_RADIUS / 2);
                this.score += 10;
                this.pizza.place(this.worm, this.canvas.width, this.canvas.height);
            }
        }

        private draw(): void {
            if (!this.ctx || !this.worm || !this.pizza || !this.canvas) return;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(
                this.resourceManager.getResource("backdrop"), 0, 0,
                this.canvas.width, this.canvas.height
            );
            this.worm.draw(this.ctx);
            this.pizza.draw(this.ctx, this.resourceManager.getResource("pizza"));

            // Draw the score in the top left corner
            this.ctx.fillStyle = "white";
            this.ctx.font = '10px "DOSFont"';
            this.ctx.fillText(`SCORE: ${this.score}`, 10, 22);
        }

        private gameTick(): void {
            this.update();
            this.draw();
        }

        public start(fullScreen?: boolean): void {
            if (!this.pizza || !this.worm || !this.canvas) return;
            this.pizza.place(this.worm, this.canvas.width, this.canvas.height);
            setInterval(() => this.gameTick(), 1000 / 60);
            if (fullScreen) this.fullScreen();
        }

        private init() {
            document.addEventListener("DOMContentLoaded", () => {
                this.initVars();
                const resources = [
                    { name: "backdrop", src: "assets/backdrop.gif" },
                    { name: "pizza", src: "assets/pizza.png" },
                ];
                this.resourceManager.load(resources, () => {
                    this.start();
                });
            });
        }
    }
}

