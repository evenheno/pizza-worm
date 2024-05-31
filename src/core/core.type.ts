export namespace CoreTypes {
    export type TResourceTypeName = 'gfx' | 'sfx' | 'midi';
    export type TResource<T extends string> = { name: T; url: string; type: TResourceTypeName; };
    export type TVector2DArr = [x: number, y: number];
    export type TVector2D = { x: number; y: number; };
    export type TResourceType = HTMLImageElement | HTMLAudioElement | ArrayBuffer;
    export type TResources<T extends string> = { [key in T]?: TResourceType };
    export type TComposition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    export type TGameState = 'idle' | 'initializing' | 'loading-res' | 'ready' | 'running' | 'crashed';
    export type TSize = { width: number; height: number; };
}