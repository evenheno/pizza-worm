import { Types } from "../pizza-worm.type";
import { PizzaWorm } from "../pizza-worm.app";
import { GameObject } from "../../core/game-object";
import { ResourceManager } from '../../core';

export class Backdrop extends GameObject<Types.ResourceID, Types.GameObjectID> {

    private sprite: HTMLImageElement;

    public constructor(app: PizzaWorm) {
        super('Backdrop', app);
    }
    public override start(): void { }
    public override update(): void { }

    public override initialize(resource: ResourceManager<Types.ResourceID>): void {
        this.sprite = resource.get('backdrop');
    }

    public override draw(ctx: CanvasRenderingContext2D,) {
        try {
            const { width, height } = this.screen;
            ctx.drawImage(this.sprite, 0, 0, width, height);
        } catch (error) {
            throw Error(`Failed to draw backdrop: ${error}`)
        }
    }
}