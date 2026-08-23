import { ColliderComponent } from "./components/collider.component";

export class CollisionSystem {
    private _colliders: ColliderComponent<any, any>[] = [];
    private _activePairs: { [pairKey: string]: boolean } = {};

    public add(collider: ColliderComponent<any, any>): void {
        if (this._colliders.indexOf(collider) >= 0) return;
        this._colliders.push(collider);
    }

    public remove(collider: ColliderComponent<any, any>): void {
        const index = this._colliders.indexOf(collider);
        if (index >= 0) {
            this._colliders.splice(index, 1);
        }

        const nextActivePairs: { [pairKey: string]: boolean } = {};
        for (const key in this._activePairs) {
            if (!Object.prototype.hasOwnProperty.call(this._activePairs, key)) continue;
            const segment = `:${collider.uid}:`;
            if (key.indexOf(segment) >= 0) continue;
            nextActivePairs[key] = this._activePairs[key];
        }
        this._activePairs = nextActivePairs;
    }

    public clear(): void {
        this._colliders = [];
        this._activePairs = {};
    }

    public update(): void {
        const nextActivePairs: { [pairKey: string]: boolean } = {};
        const colliders = this._colliders;

        for (let i = 0; i < colliders.length; i++) {
            const a = colliders[i];
            if (!a.enabled) continue;
            for (let j = i + 1; j < colliders.length; j++) {
                const b = colliders[j];
                if (!b.enabled) continue;

                const key = this.getPairKey(a.uid, b.uid);
                const intersecting = a.intersects(b);
                const wasIntersecting = !!this._activePairs[key];

                if (!intersecting) {
                    if (wasIntersecting) {
                        a.notifyCollisionExit(b);
                        b.notifyCollisionExit(a);
                    }
                    continue;
                }

                nextActivePairs[key] = true;
                if (!wasIntersecting) {
                    a.notifyCollisionEnter(b);
                    b.notifyCollisionEnter(a);
                } else {
                    a.notifyCollisionStay(b);
                    b.notifyCollisionStay(a);
                }
            }
        }

        this._activePairs = nextActivePairs;
    }

    private getPairKey(a: number, b: number): string {
        if (a < b) return `pair:${a}:${b}`;
        return `pair:${b}:${a}`;
    }
}
