import { CollisionShape } from "./collision-shape";
import { ComponentBase } from "../components/component-base";
import { IGameEvent } from "../types";

export class CollisionComponent extends ComponentBase {
    id: string;
    private collisionShapes: Map<string, CollisionShape[]> = new Map();
    
    handleEvent<T>(event: IGameEvent<T>): void {
        throw new Error("Method not implemented.");
    }

    addCollisionShape(frame: string, shapes: CollisionShape[]): void {
        this.collisionShapes.set(frame, shapes);
    }

    checkCollision(otherComponent: CollisionComponent): boolean {
        // Implement collision detection logic
        return false;
    }

    onInit(): void {
        // Initialize component
    }

    onUpdate(deltaTime: number): void {
        // Update collision logic
    }

    onDestroy(): void {
        // Cleanup component
    }
}