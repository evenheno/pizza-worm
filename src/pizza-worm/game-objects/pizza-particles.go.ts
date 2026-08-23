import { GameObject, InputManager, ResourceManager, CoreTypes } from '../../core';
import { Types } from '../pizza-worm.type';
import { GameApp } from '../../core';

type TParticle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    lifeMs: number;
    ttlMs: number;
    size: number;
    rotation: number;
    spin: number;
    alphaStart: number;
    alphaEnd: number;
    color: string;
    shimmer: number;
};

export class PizzaParticles extends GameObject<Types.ResourceID, Types.GameObjectID> {
    private _particles: TParticle[] = [];

    public constructor(app: GameApp<Types.ResourceID, Types.GameObjectID>) {
        super('PizzaParticles', app);
    }

    public override initialize(resource: ResourceManager<Types.ResourceID>): void { }
    public override start(): void { }

    public emitBurst(position: CoreTypes.TVector2D, radius: number, rgb: string): void {
        const base = this.parseColor(rgb);
        const count = 28 + Math.min(26, Math.floor(radius * 0.5));

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.32;
            const speed = 90 + Math.random() * 210 + radius * 1.3;
            const ttlMs = 420 + Math.random() * 420;
            const size = Math.max(1.2, radius * (0.07 + Math.random() * 0.11));
            const spread = radius * (0.12 + Math.random() * 0.45);
            const color = this.variantColor(base, i, count);

            this._particles.push({
                x: position.x + Math.cos(angle) * spread,
                y: position.y + Math.sin(angle) * spread,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                lifeMs: 0,
                ttlMs,
                size,
                rotation: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 9,
                alphaStart: 0.62 + Math.random() * 0.26,
                alphaEnd: 0,
                color,
                shimmer: Math.random() * Math.PI * 2,
            });
        }
    }

    public emitHeavyBloodBurst(position: CoreTypes.TVector2D, radius: number): void {
        const count = 64 + Math.min(54, Math.floor(radius * 1.1));

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
            const speed = 160 + Math.random() * 340 + radius * 1.9;
            const ttlMs = 520 + Math.random() * 620;
            const size = Math.max(1.8, radius * (0.09 + Math.random() * 0.15));
            const spread = radius * (0.08 + Math.random() * 0.48);
            const color = this.randomBloodTone(i, count);

            this._particles.push({
                x: position.x + Math.cos(angle) * spread,
                y: position.y + Math.sin(angle) * spread,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                lifeMs: 0,
                ttlMs,
                size,
                rotation: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 13,
                alphaStart: 0.74 + Math.random() * 0.22,
                alphaEnd: 0,
                color,
                shimmer: Math.random() * Math.PI * 2,
            });
        }
    }

    public clear(): void {
        this._particles = [];
    }

    public override update(inputManager: InputManager, deltaTime: number): void {
        if (!this._particles.length) return;

        const dtMs = deltaTime;
        const dt = dtMs / 1000;
        const gravity = 180;
        const drag = Math.pow(0.982, dtMs / 16.67);

        for (let i = this._particles.length - 1; i >= 0; i--) {
            const p = this._particles[i];
            p.lifeMs += dtMs;
            if (p.lifeMs >= p.ttlMs) {
                this._particles.splice(i, 1);
                continue;
            }

            p.vx *= drag;
            p.vy = p.vy * drag + gravity * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.rotation += p.spin * dt;
            p.shimmer += 0.14 + dt * 3.1;
        }
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        if (!this._particles.length) return;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        for (let i = 0; i < this._particles.length; i++) {
            const p = this._particles[i];
            const t = p.lifeMs / p.ttlMs;
            const easeOut = 1 - Math.pow(1 - t, 3);
            const alpha = this.mix(p.alphaStart, p.alphaEnd, easeOut) * (0.83 + 0.17 * Math.sin(p.shimmer));
            const size = p.size * (1 - t * 0.48);

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            ctx.fillStyle = `rgba(${p.color}, ${Math.max(0, alpha)})`;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = `rgba(255,255,255, ${Math.max(0, alpha * 0.55)})`;
            ctx.fillRect(-size * 0.9, -size * 0.16, size * 1.8, size * 0.32);
            ctx.restore();
        }

        ctx.restore();
    }

    private parseColor(rgb: string): { r: number; g: number; b: number } {
        const parts = rgb.split(',').map((x) => parseInt(x.trim(), 10));
        return {
            r: this.clampColor(parts[0]),
            g: this.clampColor(parts[1]),
            b: this.clampColor(parts[2]),
        };
    }

    private variantColor(base: { r: number; g: number; b: number }, index: number, total: number): string {
        const phase = (index / Math.max(1, total)) * Math.PI * 2;
        const lift = 18 + Math.sin(phase * 1.7) * 16 + (Math.random() - 0.5) * 20;
        const warm = 12 + Math.sin(phase * 0.9 + 0.7) * 9;

        const r = this.clampColor(base.r + lift + warm);
        const g = this.clampColor(base.g + lift * 0.7);
        const b = this.clampColor(base.b + lift * 0.35 - warm * 0.3);
        return `${r}, ${g}, ${b}`;
    }

    private randomBloodTone(index: number, total: number): string {
        const phase = (index / Math.max(1, total)) * Math.PI * 2;
        const deep = 120 + Math.sin(phase * 1.4) * 32 + (Math.random() - 0.5) * 40;
        const warm = 34 + Math.sin(phase * 0.9 + 0.8) * 18 + (Math.random() - 0.5) * 14;

        const r = this.clampColor(deep + 95);
        const g = this.clampColor(warm * 0.38);
        const b = this.clampColor(warm * 0.2);
        return `${r}, ${g}, ${b}`;
    }

    private clampColor(value: number | undefined): number {
        const target = value === undefined || Number.isNaN(value) ? 220 : value;
        return Math.max(0, Math.min(255, Math.round(target)));
    }

    private mix(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }
}