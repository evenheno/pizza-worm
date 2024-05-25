import { GfxResource } from "../obj/gfx-resource";
import { ComponentBase } from "./component-base";
import { BaseRenderer } from "../renderers/base-renderer";
import { IGameEvent } from "../types";

export class GfxComponent extends ComponentBase {

    id: 'gfx';
    private gfx: GfxResource;

    constructor(gfx: GfxResource) {
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