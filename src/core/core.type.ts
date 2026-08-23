export namespace CoreTypes {
    export type TResourceTypeName = 'gfx' | 'sfx' | 'midi';
    export type TResource<T extends string> = { name: T; url: string; type: TResourceTypeName; };
    export type TVector2DArr = [x: number, y: number];
    export type TVector2D = { x: number; y: number; };
    export type TResourceType = HTMLImageElement | HTMLAudioElement | ArrayBuffer;
    export type TResources<T extends string> = { [key in T]?: TResourceType };
    export type TResourceLoadProgress<T extends string> = {
        loaded: number;
        total: number;
        percentage: number;
        resource?: T;
        bytesLoaded: number;
        bytesTotal: number;
        resourceBytesLoaded?: number;
        resourceBytesTotal?: number;
    };
    export type TSceneTransition = {
        durationMs?: number;
        color?: string;
    };
    export type TTransitionState = 'idle' | 'fade-out' | 'fade-in';
    export type TCameraState = {
        x: number;
        y: number;
        zoom: number;
        rotation: number;
    };
    export type TCameraViewport = {
        width: number;
        height: number;
    };
    export type TInputActionMap = {
        [action: string]: string[];
    };
    export type TPointerState = {
        x: number;
        y: number;
        worldX: number;
        worldY: number;
        deltaX: number;
        deltaY: number;
        isDown: boolean;
        justPressed: boolean;
        justReleased: boolean;
        pointerType: string;
    };
    export type TComposition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    export type TGameState = 'idle' | 'initializing' | 'loading-res' | 'ready' | 'running' | 'crashed';
    export type TSize = { width: number; height: number; };
}