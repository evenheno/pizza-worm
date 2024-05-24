import { CollisionShape } from "./collision-shape";

export class BoundingBox extends CollisionShape {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    checkCollision(otherShape: CollisionShape): boolean {
        // Implement bounding box collision detection logic
        return false;
    }
}