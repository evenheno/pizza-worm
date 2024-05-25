export type TDomIds = 'canvas';

export type TPizzaWormStartOptions = {
    fullScreen: boolean
}

export type TVector2D = {
    x: number;
    y: number;
};

export type TSegment = {
    x: number;
    y: number;
    color: string;
};

export type TResource<T extends string> = {
    name: T;
    src: string;
};

export type TResources = {
    [key: string]: HTMLImageElement
};