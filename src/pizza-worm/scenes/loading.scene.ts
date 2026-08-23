import { InputManager, ResourceManager, Scene, Text } from "../../core";
import { Types } from "../pizza-worm.type";
import { PizzaWorm } from "../pizza-worm.app";
import { LoadingBar } from "../game-objects";

export class LoadingScene extends Scene<Types.ResourceID, Types.GameObjectID> {
    public constructor(app: PizzaWorm) {
        super('loading', app);
    }

    protected override onInitialize(resourceManager: ResourceManager<Types.ResourceID>): void {
        this.addObject('LoadingBar', new LoadingBar(this.app));

        this.addObject('LoadingTitle', new Text('LoadingTitle', this.app, {
            content: 'Loading Resources',
            position: 'center',
            options: {
                offset: [0, -68],
                fontSize: 25,
                color: '#EEF4FF'
            }
        }));

        this.addObject('LoadingSubtitle', new Text('LoadingSubtitle', this.app, {
            content: () => {
                const dots = '.'.repeat((Math.floor(this.app.runtime / 350) % 3) + 1);
                const progress = this.app.resourceLoadProgress;
                const percentage = Math.max(0, Math.min(100, progress.percentage || 0));
                if (percentage >= 100) return `Finalizing${dots}`;
                if (percentage >= 70) return `Optimizing game state${dots}`;
                if (percentage >= 30) return `Streaming assets${dots}`;
                return `Preparing resources${dots}`;
            },
            position: 'center',
            options: {
                offset: [0, -38],
                fontSize: 12,
                color: '#8E9AB5'
            }
        }));

        this.addObject('LoadingPercent', new Text('LoadingPercent', this.app, {
            content: () => `${Math.max(0, Math.min(100, this.app.resourceLoadProgress.percentage || 0))}%`,
            position: 'center',
            options: {
                offset: [0, -4],
                fontSize: 12,
                color: '#0A1820'
            }
        }));

        this.addObject('LoadingProgressLabel', new Text('LoadingProgressLabel', this.app, {
            content: () => {
                const progress = this.app.resourceLoadProgress;
                const bytesLoadedLabel = this.formatBytes(progress.bytesLoaded || 0);
                const bytesTotalLabel = this.formatBytes(progress.bytesTotal || 0);
                const resourceLabel = progress.resource || 'preflight';
                return `${resourceLabel} - ${bytesLoadedLabel} / ${bytesTotalLabel}`;
            },
            position: 'center',
            options: {
                offset: [0, 40],
                fontSize: 14,
                color: '#C8D3EA'
            }
        }));

        this.addObject('LoadingTip', new Text('LoadingTip', this.app, {
            content: () => 'Tip: Use A/D or Arrow Keys to steer',
            position: 'center',
            options: {
                offset: [0, 72],
                fontSize: 11,
                color: '#7382A0',
                opacity: 0.92
            }
        }));
    }

    protected override onUpdate(inputManager: InputManager, deltaTime: number): void { }

    protected override onDraw(ctx: CanvasRenderingContext2D): void { }

    private formatBytes(bytes: number): string {
        if (bytes <= 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = bytes;
        let unitIndex = 0;
        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex++;
        }
        const rounded = unitIndex === 0 ? Math.round(value).toString() : value.toFixed(1);
        return `${rounded} ${units[unitIndex]}`;
    }
}
