import { CoreTypes } from "./core.type";
import { Camera } from "./camera";

export class CameraManager {
    private _viewport: CoreTypes.TCameraViewport;
    private _cameras: Map<string, Camera>;
    private _activeCameraId: string;

    public get viewport() { return this._viewport; }
    public get activeCameraId() { return this._activeCameraId; }

    public constructor(viewport: CoreTypes.TCameraViewport) {
        this._viewport = viewport;
        this._cameras = new Map();
        this._activeCameraId = 'main';
        this._cameras.set(this._activeCameraId, new Camera(this._activeCameraId));
    }

    public setViewport(viewport: CoreTypes.TCameraViewport): void {
        this._viewport = viewport;
    }

    public createCamera(id: string, initialState?: Partial<CoreTypes.TCameraState>): Camera {
        const camera = new Camera(id, initialState);
        this._cameras.set(id, camera);
        return camera;
    }

    public getCamera(id: string): Camera {
        const camera = this._cameras.get(id);
        if (!camera) throw new Error(`Camera not found: ${id}`);
        return camera;
    }

    public setActiveCamera(id: string): void {
        if (!this._cameras.has(id)) {
            throw new Error(`Camera not found: ${id}`);
        }
        this._activeCameraId = id;
    }

    public getActiveCamera(): Camera {
        return this.getCamera(this._activeCameraId);
    }

    public removeCamera(id: string): void {
        if (id === this._activeCameraId) {
            throw new Error('Cannot remove active camera');
        }
        this._cameras.delete(id);
    }
}
