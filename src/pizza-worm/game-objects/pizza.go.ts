import { Types } from "../pizza-worm.type";
import { CoreTypes, InputManager, ResourceManager, GameObject } from '../../core';
import { GameApp } from '../../core';
import { Constants } from "../pizza-worm.const";

export class Pizza extends GameObject<Types.ResourceID, Types.GameObjectID> {
    private _pizzaSprites: HTMLImageElement[];
    private _pizzaGlowColors: string[];
    private _currentGfx: HTMLImageElement;
    private _currentSpriteIndex: number = 0;
    private _colorSampleCanvas?: HTMLCanvasElement;
    private _colorSampleCtx?: CanvasRenderingContext2D;

    public radius: number
    public position: CoreTypes.TVector2D;

    public get currentGlowColor(): string {
        return this._pizzaGlowColors[this._currentSpriteIndex] || '255, 185, 90';
    }

    public constructor(app: GameApp<Types.ResourceID, Types.GameObjectID>) {
        super('Pizza', app);
    }

    public replaceSprite() {
        this._currentSpriteIndex = Math.floor(Math.random() * this._pizzaSprites.length);
        this._currentGfx = this._pizzaSprites[this._currentSpriteIndex];
    }

    public override initialize(resource: ResourceManager<Types.ResourceID>): void {
        this._pizzaSprites = Constants.PIZZA_RESOURCE_IDS.map((id) => {
            return resource.get(id);
        });
        this._pizzaGlowColors = this._pizzaSprites.map((sprite) => this.sampleGlowColor(sprite));
        this.replaceSprite();
    }

    public override update(inputManager: InputManager, deltaTime: number): void { }
    public override start(): void { }

    public override draw(ctx: CanvasRenderingContext2D) {
        const glowColor = this._pizzaGlowColors[this._currentSpriteIndex] || '255, 185, 90';
        const pulseA = this.easeInOutSine(0.5 + 0.5 * Math.sin(this.app.runtime * 0.0068));
        const pulseB = this.easeInOutSine(0.5 + 0.5 * Math.sin(this.app.runtime * 0.0135 + 1.25));
        const pulseRaw = pulseA * 0.72 + pulseB * 0.28;
        const pulse = this.smoothstep(pulseRaw);

        const centerX = this.position.x;
        const centerY = this.position.y;
        const outerRadius = this.radius * (1.85 + 0.2 * pulse);
        const innerRadius = this.radius * 0.26;

        // Add a soft color-matched aura that fades in/out over time.
        const glow = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
        glow.addColorStop(0, `rgba(${glowColor}, ${0.5 + pulse * 0.32})`);
        glow.addColorStop(0.48, `rgba(${glowColor}, ${0.22 + pulse * 0.2})`);
        glow.addColorStop(0.76, `rgba(${glowColor}, ${0.08 + pulse * 0.1})`);
        glow.addColorStop(1, `rgba(${glowColor}, 0)`);

        const sheenOffset = this.radius * 0.28;
        const sheenRadius = this.radius * (1.15 + pulse * 0.1);
        const sheen = ctx.createRadialGradient(
            centerX - sheenOffset,
            centerY - sheenOffset,
            0,
            centerX - sheenOffset,
            centerY - sheenOffset,
            sheenRadius
        );
        sheen.addColorStop(0, `rgba(${glowColor}, ${0.35 + pulse * 0.24})`);
        sheen.addColorStop(0.55, `rgba(${glowColor}, ${0.14 + pulse * 0.12})`);
        sheen.addColorStop(1, `rgba(${glowColor}, 0)`);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
        ctx.fill();

        // Extra glossy pass for a shinier look.
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = sheen;
        ctx.beginPath();
        ctx.arc(centerX, centerY, sheenRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const x = this.position.x - this.radius;
        const y = this.position.y - this.radius;
        const w = this.radius * 2;
        const h = this.radius * 2;
        ctx.drawImage(this._currentGfx, x, y, w, h);
    }

    private easeInOutSine(t: number): number {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    private smoothstep(t: number): number {
        const clamped = Math.max(0, Math.min(1, t));
        return clamped * clamped * (3 - 2 * clamped);
    }

    private sampleGlowColor(sprite: HTMLImageElement): string {
        const sampler = this.getSamplerContext();
        if (!sampler) return '255, 185, 90';

        const { canvas, ctx } = sampler;
        const size = canvas.width;
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(sprite, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size).data;
        let red = 0;
        let green = 0;
        let blue = 0;
        let weightSum = 0;

        for (let i = 0; i < imageData.length; i += 4) {
            const alpha = imageData[i + 3];
            if (alpha < 24) continue;

            const weight = alpha / 255;
            red += imageData[i] * weight;
            green += imageData[i + 1] * weight;
            blue += imageData[i + 2] * weight;
            weightSum += weight;
        }

        if (weightSum <= 0) return '255, 185, 90';

        const r = Math.round(red / weightSum);
        const g = Math.round(green / weightSum);
        const b = Math.round(blue / weightSum);
        return `${r}, ${g}, ${b}`;
    }

    private getSamplerContext(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
        if (!this._colorSampleCanvas) {
            this._colorSampleCanvas = document.createElement('canvas');
            this._colorSampleCanvas.width = 20;
            this._colorSampleCanvas.height = 20;
        }

        if (!this._colorSampleCtx) {
            this._colorSampleCtx = this._colorSampleCanvas.getContext('2d') || undefined;
        }

        if (!this._colorSampleCtx) return null;
        return { canvas: this._colorSampleCanvas, ctx: this._colorSampleCtx };
    }
}
