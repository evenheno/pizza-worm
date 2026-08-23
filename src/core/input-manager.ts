import { Camera } from "./camera";
import { CoreTypes } from "./core.type";

const DEFAULT_ACTION_MAP: CoreTypes.TInputActionMap = {
    MoveLeft: ['ArrowLeft', 'KeyA'],
    MoveRight: ['ArrowRight', 'KeyD'],
    Confirm: ['Enter']
};

export class InputManager {
    private _targetElement: HTMLElement;

    private _actionMap: CoreTypes.TInputActionMap = {};
    private _keysDown: { [key: string]: boolean } = {};

    private _actionDownKeyboard: { [action: string]: boolean } = {};
    private _actionDownTouchSteer: { [action: string]: boolean } = {};

    private _actionPressedPending: { [action: string]: boolean } = {};
    private _actionReleasedPending: { [action: string]: boolean } = {};
    private _actionPressedFrame: { [action: string]: boolean } = {};
    private _actionReleasedFrame: { [action: string]: boolean } = {};

    private _pointerState: CoreTypes.TPointerState = {
        x: 0,
        y: 0,
        worldX: 0,
        worldY: 0,
        deltaX: 0,
        deltaY: 0,
        isDown: false,
        justPressed: false,
        justReleased: false,
        pointerType: 'none'
    };

    private _pointerPendingPressed: boolean = false;
    private _pointerPendingReleased: boolean = false;
    private _pointerPendingDeltaX: number = 0;
    private _pointerPendingDeltaY: number = 0;
    private _pointerLastX: number = 0;
    private _pointerLastY: number = 0;
    private _hasPointerPosition: boolean = false;

    private _onKeyDown?: (e: KeyboardEvent) => void;
    private _onKeyUp?: (e: KeyboardEvent) => void;
    private _onBlur?: () => void;

    private _onPointerDown?: (e: PointerEvent) => void;
    private _onPointerMove?: (e: PointerEvent) => void;
    private _onPointerUp?: (e: PointerEvent) => void;
    private _onPointerCancel?: (e: PointerEvent) => void;

    private _onMouseDown?: (e: MouseEvent) => void;
    private _onMouseMove?: (e: MouseEvent) => void;
    private _onMouseUp?: (e: MouseEvent) => void;
    private _onTouchStart?: (e: TouchEvent) => void;
    private _onTouchMove?: (e: TouchEvent) => void;
    private _onTouchEnd?: (e: TouchEvent) => void;
    private _usingPointerEvents: boolean = false;

    constructor(targetElement?: HTMLElement) {
        this._targetElement = targetElement || document.body;
        this.setActionMap(DEFAULT_ACTION_MAP);
        this.initialize();
    }

    private initialize(): void {
        this.setupKeyboardListeners();
        this.setupPointerListeners();
    }

    private setupKeyboardListeners(): void {
        this._onKeyDown = (e: KeyboardEvent) => {
            const key = this.normalizeKeyboardKey(e);
            if (!key) return;
            e.preventDefault();
            if (!this._keysDown[key]) {
                this._keysDown[key] = true;
                this.refreshKeyboardActionStates();
            }
        };

        this._onKeyUp = (e: KeyboardEvent) => {
            const key = this.normalizeKeyboardKey(e);
            if (!key) return;
            if (this._keysDown[key]) {
                this._keysDown[key] = false;
                this.refreshKeyboardActionStates();
            }
        };

        this._onBlur = () => this.clearKeyboardState();

        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
        window.addEventListener('blur', this._onBlur);
    }

    private normalizeKeyboardKey(e: KeyboardEvent): string | null {
        if (e.code) return e.code;
        if (!e.key) return null;
        if (e.key.length === 1) return `Key${e.key.toUpperCase()}`;
        return e.key;
    }

    private clearKeyboardState(): void {
        for (const key in this._keysDown) {
            if (!Object.prototype.hasOwnProperty.call(this._keysDown, key)) continue;
            this._keysDown[key] = false;
        }
        this.refreshKeyboardActionStates();
    }

    private setupPointerListeners(): void {
        if (window.PointerEvent) {
            this._usingPointerEvents = true;
            this._onPointerDown = (e: PointerEvent) => {
                this.applyPointerPositionFromMouseEvent(e, e.clientX, e.clientY);
                this.beginPointerDown(e.pointerType || 'mouse');
                e.preventDefault();
            };
            this._onPointerMove = (e: PointerEvent) => {
                this.applyPointerPositionFromMouseEvent(e, e.clientX, e.clientY);
                this._pointerState.pointerType = e.pointerType || this._pointerState.pointerType;
                this.updateTouchSteering();
                e.preventDefault();
            };
            this._onPointerUp = (e: PointerEvent) => {
                this.applyPointerPositionFromMouseEvent(e, e.clientX, e.clientY);
                this.endPointerDown();
                e.preventDefault();
            };
            this._onPointerCancel = (e: PointerEvent) => {
                this.applyPointerPositionFromMouseEvent(e, e.clientX, e.clientY);
                this.endPointerDown();
                e.preventDefault();
            };

            this._targetElement.addEventListener('pointerdown', this._onPointerDown, { passive: false });
            this._targetElement.addEventListener('pointermove', this._onPointerMove, { passive: false });
            this._targetElement.addEventListener('pointerup', this._onPointerUp, { passive: false });
            this._targetElement.addEventListener('pointercancel', this._onPointerCancel, { passive: false });
            return;
        }

        // Fallback for browsers without Pointer Events.
        this._onMouseDown = (e: MouseEvent) => {
            this.applyPointerPositionFromMouseEvent(e, e.clientX, e.clientY);
            this.beginPointerDown('mouse');
        };
        this._onMouseMove = (e: MouseEvent) => {
            this.applyPointerPositionFromMouseEvent(e, e.clientX, e.clientY);
            this._pointerState.pointerType = 'mouse';
            this.updateTouchSteering();
        };
        this._onMouseUp = (e: MouseEvent) => {
            this.applyPointerPositionFromClient(e.clientX, e.clientY);
            this.endPointerDown();
        };

        this._onTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (!touch) return;
            this.applyPointerPositionFromClient(touch.clientX, touch.clientY);
            this.beginPointerDown('touch');
            e.preventDefault();
        };
        this._onTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (!touch) return;
            this.applyPointerPositionFromClient(touch.clientX, touch.clientY);
            this._pointerState.pointerType = 'touch';
            this.updateTouchSteering();
            e.preventDefault();
        };
        this._onTouchEnd = (e: TouchEvent) => {
            const touch = e.changedTouches[0];
            if (touch) this.applyPointerPositionFromClient(touch.clientX, touch.clientY);
            this.endPointerDown();
            e.preventDefault();
        };

        this._targetElement.addEventListener('mousedown', this._onMouseDown);
        this._targetElement.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);
        this._targetElement.addEventListener('touchstart', this._onTouchStart, { passive: false });
        this._targetElement.addEventListener('touchmove', this._onTouchMove, { passive: false });
        this._targetElement.addEventListener('touchend', this._onTouchEnd, { passive: false });
        this._targetElement.addEventListener('touchcancel', this._onTouchEnd, { passive: false });
    }

    private beginPointerDown(pointerType: string): void {
        if (!this._pointerState.isDown) {
            this._pointerPendingPressed = true;
        }
        this._pointerState.isDown = true;
        this._pointerState.pointerType = pointerType;
        this.updateTouchSteering();
    }

    private endPointerDown(): void {
        if (this._pointerState.isDown) {
            this._pointerPendingReleased = true;
        }
        this._pointerState.isDown = false;
        this.setTouchSteerAction('MoveLeft', false);
        this.setTouchSteerAction('MoveRight', false);
    }

    private applyPointerPositionFromClient(clientX: number, clientY: number): void {
        const rect = this._targetElement.getBoundingClientRect();
        const canvas = this._targetElement as HTMLCanvasElement;
        const widthScale = rect.width > 0 && canvas.width ? canvas.width / rect.width : 1;
        const heightScale = rect.height > 0 && canvas.height ? canvas.height / rect.height : 1;

        const localX = (clientX - rect.left) * widthScale;
        const localY = (clientY - rect.top) * heightScale;
        this.applyPointerPositionFromLocal(localX, localY);
    }

    private applyPointerPositionFromMouseEvent(event: MouseEvent, clientX: number, clientY: number): void {
        const canvas = this._targetElement as HTMLCanvasElement;
        const isTargetCanvas = event.target === this._targetElement;
        if (!isTargetCanvas) {
            this.applyPointerPositionFromClient(clientX, clientY);
            return;
        }

        const rect = this._targetElement.getBoundingClientRect();
        const widthScale = rect.width > 0 && canvas.width ? canvas.width / rect.width : 1;
        const heightScale = rect.height > 0 && canvas.height ? canvas.height / rect.height : 1;
        const localX = event.offsetX * widthScale;
        const localY = event.offsetY * heightScale;
        this.applyPointerPositionFromLocal(localX, localY);
    }

    private applyPointerPositionFromLocal(localX: number, localY: number): void {

        if (!this._hasPointerPosition) {
            this._pointerLastX = localX;
            this._pointerLastY = localY;
            this._hasPointerPosition = true;
        }

        this._pointerPendingDeltaX += localX - this._pointerLastX;
        this._pointerPendingDeltaY += localY - this._pointerLastY;
        this._pointerLastX = localX;
        this._pointerLastY = localY;
        this._pointerState.x = localX;
        this._pointerState.y = localY;
    }

    private updateTouchSteering(): void {
        if (!this._pointerState.isDown) {
            this.setTouchSteerAction('MoveLeft', false);
            this.setTouchSteerAction('MoveRight', false);
            return;
        }

        const canvas = this._targetElement as HTMLCanvasElement;
        const width = canvas.width || this._targetElement.clientWidth;
        const middleX = width / 2;
        if (this._pointerState.x < middleX) {
            this.setTouchSteerAction('MoveLeft', true);
            this.setTouchSteerAction('MoveRight', false);
        } else {
            this.setTouchSteerAction('MoveLeft', false);
            this.setTouchSteerAction('MoveRight', true);
        }
    }

    private setTouchSteerAction(action: string, isDown: boolean): void {
        if (!!this._actionDownTouchSteer[action] === isDown) return;
        const before = this.isActionDown(action);
        this._actionDownTouchSteer[action] = isDown;
        const after = this.isActionDown(action);
        this.applyActionEdge(action, before, after);
    }

    private refreshKeyboardActionStates(): void {
        for (const action in this._actionMap) {
            if (!Object.prototype.hasOwnProperty.call(this._actionMap, action)) continue;
            const before = this.isActionDown(action);
            const keyCodes = this._actionMap[action];

            let keyboardDown = false;
            for (let i = 0; i < keyCodes.length; i++) {
                if (this._keysDown[keyCodes[i]]) {
                    keyboardDown = true;
                    break;
                }
            }

            this._actionDownKeyboard[action] = keyboardDown;
            const after = this.isActionDown(action);
            this.applyActionEdge(action, before, after);
        }
    }

    private applyActionEdge(action: string, before: boolean, after: boolean): void {
        if (!before && after) {
            this._actionPressedPending[action] = true;
        }
        if (before && !after) {
            this._actionReleasedPending[action] = true;
        }
    }

    private clearActionEdgesFrame(): void {
        for (const action in this._actionPressedFrame) {
            if (!Object.prototype.hasOwnProperty.call(this._actionPressedFrame, action)) continue;
            this._actionPressedFrame[action] = false;
        }
        for (const action in this._actionReleasedFrame) {
            if (!Object.prototype.hasOwnProperty.call(this._actionReleasedFrame, action)) continue;
            this._actionReleasedFrame[action] = false;
        }
    }

    private consumeActionEdgePending(): void {
        this.clearActionEdgesFrame();
        for (const action in this._actionPressedPending) {
            if (!Object.prototype.hasOwnProperty.call(this._actionPressedPending, action)) continue;
            if (!this._actionPressedPending[action]) continue;
            this._actionPressedFrame[action] = true;
            this._actionPressedPending[action] = false;
        }
        for (const action in this._actionReleasedPending) {
            if (!Object.prototype.hasOwnProperty.call(this._actionReleasedPending, action)) continue;
            if (!this._actionReleasedPending[action]) continue;
            this._actionReleasedFrame[action] = true;
            this._actionReleasedPending[action] = false;
        }
    }

    private toWorldPosition(camera: Camera, screenX: number, screenY: number): CoreTypes.TVector2D {
        const zoom = camera.zoom || 1;
        const normalizedX = screenX / zoom;
        const normalizedY = screenY / zoom;

        const cos = Math.cos(camera.rotation);
        const sin = Math.sin(camera.rotation);
        const rotatedX = normalizedX * cos + normalizedY * sin;
        const rotatedY = -normalizedX * sin + normalizedY * cos;

        return {
            x: rotatedX + camera.x,
            y: rotatedY + camera.y
        };
    }

    public beginFrame(camera?: Camera): void {
        this.consumeActionEdgePending();

        this._pointerState.justPressed = this._pointerPendingPressed;
        this._pointerState.justReleased = this._pointerPendingReleased;
        this._pointerState.deltaX = this._pointerPendingDeltaX;
        this._pointerState.deltaY = this._pointerPendingDeltaY;

        this._pointerPendingPressed = false;
        this._pointerPendingReleased = false;
        this._pointerPendingDeltaX = 0;
        this._pointerPendingDeltaY = 0;

        if (camera) {
            const worldPosition = this.toWorldPosition(camera, this._pointerState.x, this._pointerState.y);
            this._pointerState.worldX = worldPosition.x;
            this._pointerState.worldY = worldPosition.y;
        } else {
            this._pointerState.worldX = this._pointerState.x;
            this._pointerState.worldY = this._pointerState.y;
        }
    }

    public setActionMap(actionMap: CoreTypes.TInputActionMap): void {
        this._actionMap = {};
        for (const action in actionMap) {
            if (!Object.prototype.hasOwnProperty.call(actionMap, action)) continue;
            this._actionMap[action] = actionMap[action].slice();
            this._actionDownKeyboard[action] = false;
            this._actionDownTouchSteer[action] = false;
            this._actionPressedPending[action] = false;
            this._actionReleasedPending[action] = false;
            this._actionPressedFrame[action] = false;
            this._actionReleasedFrame[action] = false;
        }
        this.refreshKeyboardActionStates();
    }

    public bindAction(action: string, keyCodes: string[]): void {
        this._actionMap[action] = keyCodes.slice();
        if (this._actionDownKeyboard[action] === undefined) this._actionDownKeyboard[action] = false;
        if (this._actionDownTouchSteer[action] === undefined) this._actionDownTouchSteer[action] = false;
        if (this._actionPressedPending[action] === undefined) this._actionPressedPending[action] = false;
        if (this._actionReleasedPending[action] === undefined) this._actionReleasedPending[action] = false;
        if (this._actionPressedFrame[action] === undefined) this._actionPressedFrame[action] = false;
        if (this._actionReleasedFrame[action] === undefined) this._actionReleasedFrame[action] = false;
        this.refreshKeyboardActionStates();
    }

    public isActionDown(action: string): boolean {
        return !!this._actionDownKeyboard[action] || !!this._actionDownTouchSteer[action];
    }

    public wasActionPressed(action: string): boolean {
        return !!this._actionPressedFrame[action];
    }

    public wasActionReleased(action: string): boolean {
        return !!this._actionReleasedFrame[action];
    }

    public getPointerState(): CoreTypes.TPointerState {
        return { ...this._pointerState };
    }

    isTurningLeft(): boolean { return this.isActionDown('MoveLeft'); }
    isTurningRight(): boolean { return this.isActionDown('MoveRight'); }
    isAnyKey(): boolean {
        for (const action in this._actionMap) {
            if (!Object.prototype.hasOwnProperty.call(this._actionMap, action)) continue;
            if (this.isActionDown(action)) return true;
        }
        return false;
    }
    isEnter(): boolean { return this.isActionDown('Confirm'); }

    destroy(): void {
        if (this._onKeyDown) document.removeEventListener('keydown', this._onKeyDown);
        if (this._onKeyUp) document.removeEventListener('keyup', this._onKeyUp);
        if (this._onBlur) window.removeEventListener('blur', this._onBlur);

        if (this._usingPointerEvents) {
            if (this._onPointerDown) this._targetElement.removeEventListener('pointerdown', this._onPointerDown);
            if (this._onPointerMove) this._targetElement.removeEventListener('pointermove', this._onPointerMove);
            if (this._onPointerUp) this._targetElement.removeEventListener('pointerup', this._onPointerUp);
            if (this._onPointerCancel) this._targetElement.removeEventListener('pointercancel', this._onPointerCancel);
        } else {
            if (this._onMouseDown) this._targetElement.removeEventListener('mousedown', this._onMouseDown);
            if (this._onMouseMove) this._targetElement.removeEventListener('mousemove', this._onMouseMove);
            if (this._onMouseUp) window.removeEventListener('mouseup', this._onMouseUp);
            if (this._onTouchStart) this._targetElement.removeEventListener('touchstart', this._onTouchStart);
            if (this._onTouchMove) this._targetElement.removeEventListener('touchmove', this._onTouchMove);
            if (this._onTouchEnd) {
                this._targetElement.removeEventListener('touchend', this._onTouchEnd);
                this._targetElement.removeEventListener('touchcancel', this._onTouchEnd);
            }
        }
        this.clearKeyboardState();
        this.setTouchSteerAction('MoveLeft', false);
        this.setTouchSteerAction('MoveRight', false);
        this._pointerState.isDown = false;
    }
}
