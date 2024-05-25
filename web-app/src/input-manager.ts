export class InputManager {
    private keyMap: { [key: string]: boolean } = {};
    private touchStartX: number | null = null;
    private touchStartY: number | null = null;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        this.setupKeyboardListeners();
        this.setupTouchListeners();
    }

    private setupKeyboardListeners(): void {
        document.addEventListener('keydown', (e) => {
            this.keyMap[e.key] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keyMap[e.key] = false;
        });
    }

    private setupTouchListeners(): void {
        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        });

        document.addEventListener('touchmove', (e) => {
            if (this.touchStartX === null || this.touchStartY === null) return;

            const touch = e.touches[0];
            const deltaX = touch.clientX - this.touchStartX;
            const deltaY = touch.clientY - this.touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) {
                    this.keyMap['ArrowRight'] = true;
                    this.keyMap['ArrowLeft'] = false;
                } else {
                    this.keyMap['ArrowLeft'] = true;
                    this.keyMap['ArrowRight'] = false;
                }
            } else {
                this.keyMap['ArrowRight'] = false;
                this.keyMap['ArrowLeft'] = false;
            }
        });

        document.addEventListener('touchend', (e) => {
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;

            if (this.touchStartX !== null && this.touchStartY !== null) {
                const deltaX = endX - this.touchStartX;
                const deltaY = endY - this.touchStartY;

                if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
                    this.keyMap['Enter'] = true;
                }
            }

            this.touchStartX = null;
            this.touchStartY = null;
            this.keyMap['ArrowRight'] = false;
            this.keyMap['ArrowLeft'] = false;
        });
    }

    isTurningLeft(): boolean {
        return !!this.keyMap['ArrowLeft'];
    }

    isTurningRight(): boolean {
        return !!this.keyMap['ArrowRight'];
    }

    isAnyKey(): boolean {
        return Object.values(this.keyMap).some(value => value);
    }

    isEnter(): boolean {
        return !!this.keyMap['Enter'];
    }
}
