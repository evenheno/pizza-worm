
import { PizzaWorm } from "../pizza-worm.app";
import { InputManager, ResourceManager } from '../../core';
import { GameObject } from "../../core/game-object";
import { Types } from "../pizza-worm.type";

export class Backdrop extends GameObject<Types.ResourceID> {
    private sprite: HTMLImageElement;

    public constructor(app: PizzaWorm) {
        super(app);
    }

    public override update(): void { }

    public override initialize(resource: ResourceManager<Types.ResourceID>): void {
        this.sprite = resource.get('backdrop');
    }

    public override draw(ctx: CanvasRenderingContext2D,) {
        const { width, height } = this.screen;
        ctx.drawImage(this.sprite, 0, 0, width, height);
    }
}