import { IGameEvent, TVector2D } from "../types";
import { ComponentBase } from "./component-base";

export class PositionComponent extends ComponentBase {
    id: 'position'
    position: TVector2D;

    constructor(position: TVector2D) {
        super();
        this.position = position;
    }

    handleEvent<T>(event: IGameEvent<T>): void {
        throw new Error("Method not implemented.");
    }

    onInit(): void {
        // Initialize component
    }

    onUpdate(deltaTime: number): void {
        // Update position logic
    }

    onDestroy(): void {
        // Cleanup component
    }
}