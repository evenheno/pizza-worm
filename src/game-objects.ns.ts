export namespace GameObjects {
    export class Pizza {
        public position: TPosition | null = null;
        
        constructor(private radius: number) { }

        private getRandomPosition(canvasWidth: number, canvasHeight: number): TPosition {
            return {
                x: Math.floor(Math.random() * (canvasWidth - 2 * this.radius)) + this.radius,
                y: Math.floor(Math.random() * (canvasHeight - 2 * this.radius)) + this.radius,
            };
        }

        place(worm: Worm, canvasWidth: number, canvasHeight: number): void {
            let position: TPosition, hasCollision: boolean;
            do {
                position = this.getRandomPosition(canvasWidth, canvasHeight);
                hasCollision = worm.collidesWith(position.x, position.y, this.radius);
            } while (hasCollision);
            this.position = position;
        }

        draw(ctx: CanvasRenderingContext2D, image: HTMLImageElement): void {
            if (this.position) {
                ctx.drawImage(
                    image,
                    this.position.x - this.radius,
                    this.position.y - this.radius,
                    this.radius * 2,
                    this.radius * 2
                );
            }
        }
    }

    export class Worm {
        private segments: TSegment[] = [];
        private angle: number = 0;
        public turningLeft: boolean = false;
        public turningRight: boolean = false;

        constructor(
            canvasWidth: number,
            canvasHeight: number,
            private initialLength: number,
            private thickness: number,
            private speed: number,
            private colors: string[]
        ) {
            for (let i = 0; i < initialLength; i++) {
                this.segments.push({ x: canvasWidth / 2, y: canvasHeight / 2 });
            }
        }

        updateAngle(turningSpeed: number): void {
            if (this.turningLeft) this.angle -= turningSpeed;
            if (this.turningRight) this.angle += turningSpeed;
        }

        move(canvasWidth: number, canvasHeight: number): void {
            const head: TSegment = {
                x: this.segments[this.segments.length - 1].x + Math.cos(this.angle) * this.speed,
                y: this.segments[this.segments.length - 1].y + Math.sin(this.angle) * this.speed,
            };
            if (head.x < 0) head.x = canvasWidth;
            if (head.x >= canvasWidth) head.x = 0;
            if (head.y < 0) head.y = canvasHeight;
            if (head.y >= canvasHeight) head.y = 0;
            this.segments.push(head);
        }

        trim(): void {
            if (this.segments.length > this.initialLength) this.segments.shift();
        }

        draw(ctx: CanvasRenderingContext2D): void {
            for (let i = 0; i < this.segments.length; i++) {
                ctx.fillStyle = this.colors[i % this.colors.length];
                ctx.beginPath();
                ctx.arc(this.segments[i].x, this.segments[i].y, this.thickness / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        collidesWith(x: number, y: number, radius: number): boolean {
            return this.segments.some(segment => Math.hypot(segment.x - x, segment.y - y) < this.thickness + radius);
        }
    }

    export type TPosition = {
        x: number;
        y: number;
    };

    export type TSegment = {
        x: number;
        y: number;
    };
}