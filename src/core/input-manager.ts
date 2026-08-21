export class InputManager {
    private _keyMap: { [key: string]: boolean } = {};
    private _touchStartX: number | null = null;
    private _touchStartY: number | null = null;
    private _targetElement: HTMLElement;

    constructor(targetElement?: HTMLElement) {
        this._targetElement = targetElement || document.body;
        this.initialize();
    }

    private initialize(): void {
        this.setupKeyboardListeners();
        this.setupTouchListeners();
    }

    private setupKeyboardListeners(): void {
        document.addEventListener('keydown', (e) => {
            const key = this.normalizeKeyboardKey(e);
            if (!key) return;
            e.preventDefault();
            this._keyMap[key] = true;
        });
        document.addEventListener('keyup', (e) => {
            const key = this.normalizeKeyboardKey(e);
            if (key) this._keyMap[key] = false;
        });
        window.addEventListener('blur', () => this.clearKeyboardState());
    }

    private normalizeKeyboardKey(e: KeyboardEvent): 'ArrowLeft' | 'ArrowRight' | 'Enter' | null {
        switch (e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                return 'ArrowLeft';
            case 'ArrowRight':
            case 'KeyD':
                return 'ArrowRight';
            case 'Enter':
                return 'Enter';
            default:
                // KeyboardEvent.code is preferred, but key keeps this working
                // in older browsers and synthetic keyboard events.
                if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') return 'ArrowLeft';
                if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') return 'ArrowRight';
                if (e.key === 'Enter') return 'Enter';
                return null;
        }
    }

    private clearKeyboardState(): void {
        this._keyMap['ArrowLeft'] = false;
        this._keyMap['ArrowRight'] = false;
        this._keyMap['Enter'] = false;
    }

    private setupTouchListeners(): void {
        const touchOptions = { passive: false };

        this._targetElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._touchStartX = touch.clientX;
            this._touchStartY = touch.clientY;
            this.updateTouchDirection(touch.clientX);
        }, touchOptions);

        this._targetElement.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._touchStartX = touch.clientX;
            this._touchStartY = touch.clientY;
            this.updateTouchDirection(touch.clientX);
        }, touchOptions);

        const clearTouchDirection = () => {
            this._touchStartX = null;
            this._touchStartY = null;
            this._keyMap['ArrowRight'] = false;
            this._keyMap['ArrowLeft'] = false;
        };

        this._targetElement.addEventListener('touchend', clearTouchDirection);
        this._targetElement.addEventListener('touchcancel', clearTouchDirection);
    }

    private updateTouchDirection(clientX: number): void {
        const rect = this._targetElement.getBoundingClientRect();
        const middleX = rect.left + rect.width / 2;
        if (clientX < middleX) {
            this._keyMap['ArrowLeft'] = true;
            this._keyMap['ArrowRight'] = false;
        } else {
            this._keyMap['ArrowRight'] = true;
            this._keyMap['ArrowLeft'] = false;
        }
    }

    isTurningLeft(): boolean { return !!this._keyMap['ArrowLeft']; }
    isTurningRight(): boolean { return !!this._keyMap['ArrowRight']; }
    isAnyKey(): boolean { return Object.values(this._keyMap).some(value => value); }
    isEnter(): boolean { return this._keyMap['Enter']; }
}
