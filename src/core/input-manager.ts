export class InputManager {
    private _keyMap: { [key: string]: boolean } = {};
    private _touchStartX: number | null = null;
    private _touchStartY: number | null = null;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        this.setupKeyboardListeners();
        this.setupTouchListeners();
    }

    private setupKeyboardListeners(): void {
        document.addEventListener('keydown', (e) => this._keyMap[e.key] = true);
        document.addEventListener('keyup', (e) => this._keyMap[e.key] = false);
    }

    private setupTouchListeners(): void {
        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this._touchStartX = touch.clientX;
            this._touchStartY = touch.clientY;

            const screenWidth = window.innerWidth;
            if (this._touchStartX < screenWidth / 2) {
                this._keyMap['ArrowLeft'] = true;
                this._keyMap['ArrowRight'] = false;
            } else {
                this._keyMap['ArrowRight'] = true;
                this._keyMap['ArrowLeft'] = false;
            }
        });

        document.addEventListener('touchend', (e) => {
            this._touchStartX = null;
            this._touchStartY = null;
            this._keyMap['ArrowRight'] = false;
            this._keyMap['ArrowLeft'] = false;
        });
    }

    isTurningLeft(): boolean { return !!this._keyMap['ArrowLeft']; }
    isTurningRight(): boolean { return !!this._keyMap['ArrowRight']; }
    isAnyKey(): boolean { return Object.values(this._keyMap).some(value => value); }
    isEnter(): boolean { return this._keyMap['Enter']; }
}
