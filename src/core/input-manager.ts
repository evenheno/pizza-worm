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

            const screenWidth = window.innerWidth;
            if (this.touchStartX < screenWidth / 2) {
                this.keyMap['ArrowLeft'] = true;
                this.keyMap['ArrowRight'] = false;
            } else {
                this.keyMap['ArrowRight'] = true;
                this.keyMap['ArrowLeft'] = false;
            }
        });

        document.addEventListener('touchend', (e) => {
            this.touchStartX = null;
            this.touchStartY = null;
            this.keyMap['ArrowRight'] = false;
            this.keyMap['ArrowLeft'] = false;
        });
    }

    isTurningLeft(): boolean { return !!this.keyMap['ArrowLeft']; }
    isTurningRight(): boolean { return !!this.keyMap['ArrowRight']; }
    isAnyKey(): boolean { return Object.values(this.keyMap).some(value => value); }
    isEnter(): boolean { return !!this.keyMap['Enter']; }
}
