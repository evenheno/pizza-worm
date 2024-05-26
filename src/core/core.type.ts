export namespace CoreTypes {

    export type TResourceTypeName = 'Gfx' | 'Sfx';

    export type TResource<T extends string> = {
        name: T;
        src: string;
        type: TResourceTypeName;
    };
    export type TVector2DArr = [x: number, y: number];
    export type TVector2D = {
        x: number;
        y: number;
    };

    export type TResourceType = HTMLImageElement | HTMLAudioElement;

    export type TResources<T extends string> = {
        [key in T]?: TResourceType
    };


    export type TComposition = 'Center' | 'TopLeft' | 'TopRight' | 'BottomLeft' | 'BottomRight';

    export type TGameState = 'Idle' | 'Initializing' | 'LoadingRes' | 'Ready' | 'Running' | 'Crashed';

    export type TSize = {
        width: number;
        height: number;
    };
}