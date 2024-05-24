import { ComponentBase } from "./component-base";
import { IGameEvent } from "../types/game-event.interface";

export class PositionComponent extends ComponentBase {

    id: 'position'
    position: { x: number, y: number };

    constructor(initialPosition: { x: number, y: number }) {
        super();
        this.position = initialPosition;
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