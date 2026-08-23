import { GameApp, GameObject, InputManager, ResourceManager } from "../../core";
import { Types } from "../pizza-worm.type";

export class LoadingBar extends GameObject<Types.ResourceID, Types.GameObjectID> {
    public constructor(app: GameApp<Types.ResourceID, Types.GameObjectID>) {
        super('LoadingBar', app);
    }

    public override initialize(resource: ResourceManager<Types.ResourceID>): void { }
    public override start(): void { }
    public override update(inputManager: InputManager, deltaTime: number): void { }

    public override draw(ctx: CanvasRenderingContext2D): void {
        const screen = this.screen;
        const progress = this.app.resourceLoadProgress;
        const percentage = Math.max(0, Math.min(100, progress.percentage || 0));

        const panelWidth = Math.floor(screen.width * 0.72);
        const panelHeight = 210;
        const panelX = Math.floor((screen.width - panelWidth) / 2);
        const panelY = Math.floor((screen.height - panelHeight) / 2);

        const barWidth = Math.floor(panelWidth * 0.82);
        const barHeight = 24;
        const barX = Math.floor((screen.width - barWidth) / 2);
        const barY = panelY + 100;

        const fillWidth = Math.floor((percentage / 100) * (barWidth - 8));

        ctx.save();

        // Backdrop with depth.
        const backGradient = ctx.createLinearGradient(0, 0, 0, screen.height);
        backGradient.addColorStop(0, '#07080D');
        backGradient.addColorStop(1, '#040507');
        ctx.fillStyle = backGradient;
        ctx.fillRect(0, 0, screen.width, screen.height);

        const centerGlow = ctx.createRadialGradient(
            screen.width * 0.5,
            screen.height * 0.52,
            20,
            screen.width * 0.5,
            screen.height * 0.52,
            screen.width * 0.55
        );
        centerGlow.addColorStop(0, 'rgba(70, 130, 255, 0.13)');
        centerGlow.addColorStop(1, 'rgba(70, 130, 255, 0)');
        ctx.fillStyle = centerGlow;
        ctx.fillRect(0, 0, screen.width, screen.height);

        // Panel shadow.
        this.fillRoundedRect(ctx, panelX + 6, panelY + 10, panelWidth, panelHeight, 16, 'rgba(0, 0, 0, 0.35)');

        // Panel body.
        const panelGradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
        panelGradient.addColorStop(0, '#1A1E29');
        panelGradient.addColorStop(1, '#11131B');
        this.fillRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 16, panelGradient);
        this.strokeRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 16, '#2d3343', 2);

        // Panel top accent.
        const accentGradient = ctx.createLinearGradient(panelX, panelY + 1, panelX + panelWidth, panelY + 1);
        accentGradient.addColorStop(0, 'rgba(115, 190, 255, 0)');
        accentGradient.addColorStop(0.5, 'rgba(115, 190, 255, 0.35)');
        accentGradient.addColorStop(1, 'rgba(115, 190, 255, 0)');
        ctx.fillStyle = accentGradient;
        ctx.fillRect(panelX + 18, panelY + 1, panelWidth - 36, 2);

        // Bar frame.
        this.fillRoundedRect(ctx, barX, barY, barWidth, barHeight, 10, '#1C2230');
        this.strokeRoundedRect(ctx, barX, barY, barWidth, barHeight, 10, '#30384b', 2);

        // Track texture lines.
        ctx.save();
        this.clipRoundedRectPath(ctx, barX + 2, barY + 2, barWidth - 4, barHeight - 4, 8);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let x = barX + 6; x < barX + barWidth - 6; x += 8) {
            ctx.beginPath();
            ctx.moveTo(x, barY + 3);
            ctx.lineTo(x, barY + barHeight - 3);
            ctx.stroke();
        }
        ctx.restore();

        // Bar fill.
        const fillGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY + barHeight);
        fillGradient.addColorStop(0, '#3AA7FF');
        fillGradient.addColorStop(0.55, '#53D8FF');
        fillGradient.addColorStop(1, '#5BF1A6');
        this.fillRoundedRect(ctx, barX + 4, barY + 4, Math.max(0, fillWidth), Math.max(0, barHeight - 8), 6, fillGradient);

        // Fill glow.
        if (fillWidth > 4) {
            const pulse = 0.3 + ((Math.sin(this.app.runtime / 260) + 1) * 0.18);
            ctx.save();
            ctx.shadowColor = `rgba(83, 216, 255, ${pulse.toFixed(3)})`;
            ctx.shadowBlur = 12;
            ctx.fillStyle = 'rgba(83, 216, 255, 0.45)';
            ctx.fillRect(barX + 4, barY + barHeight - 6, fillWidth, 2);
            ctx.restore();
        }

        // Animated sheen for premium feel.
        if (fillWidth > 8) {
            const sheenWidth = 50;
            const cycle = 1800;
            const phase = (this.app.runtime % cycle) / cycle;
            const sheenX = barX + 4 + Math.floor((fillWidth + sheenWidth) * phase) - sheenWidth;
            ctx.save();
            this.clipRoundedRectPath(ctx, barX + 4, barY + 4, fillWidth, Math.max(0, barHeight - 8), 6);
            const sheenGradient = ctx.createLinearGradient(sheenX, barY, sheenX + sheenWidth, barY);
            sheenGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            sheenGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
            sheenGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = sheenGradient;
            ctx.fillRect(sheenX, barY + 4, sheenWidth, Math.max(0, barHeight - 8));
            ctx.restore();
        }

        ctx.restore();
    }

    private fillRoundedRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
        fill: string | CanvasGradient
    ): void {
        ctx.save();
        this.roundedRectPath(ctx, x, y, width, height, radius);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.restore();
    }

    private strokeRoundedRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
        stroke: string,
        lineWidth: number
    ): void {
        ctx.save();
        this.roundedRectPath(ctx, x, y, width, height, radius);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.restore();
    }

    private clipRoundedRectPath(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
    ): void {
        this.roundedRectPath(ctx, x, y, width, height, radius);
        ctx.clip();
    }

    private roundedRectPath(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
    ): void {
        const r = Math.max(0, Math.min(radius, Math.floor(Math.min(width, height) / 2)));
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }
}
