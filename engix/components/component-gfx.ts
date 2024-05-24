import { Gfx } from "../obj/gfx";
import { ComponentBase } from "./component-base";
import { IGameEvent } from "../types/game-event.interface";
import { BaseRenderer } from "../renderers/base-renderer";

export class GfxComponent extends ComponentBase {

    id: 'gfx';
    private gfx: Gfx;

    constructor(gfx: Gfx) {
        super();
        this.gfx = gfx;
    }

    handleEvent<T>(event: IGameEvent<T>): void {
        throw new Error("Method not implemented.");
    }

    onInit(): void {
        // Initialize component
    }

    onUpdate(deltaTime: number): void {
        // Update graphics logic
    }

    onDestroy(): void {
        // Cleanup component
    }

    onDraw(renderer: BaseRenderer): void {
        // Drawing logic
    }
}