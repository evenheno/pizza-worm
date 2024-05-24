export abstract class CollisionShape {
    abstract checkCollision(otherShape: CollisionShape): boolean;
}