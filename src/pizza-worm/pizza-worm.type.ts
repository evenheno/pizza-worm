export namespace Types {

    export type StartOptions = {
        fullScreen: boolean
    }

    export type WormSegment = {
        x: number;
        y: number;
        color: string;
    };

    export type ResourceID =
        | 'midi-file'
        | 'pizza-pepperoni'
        | 'pizza-mushrooms'
        | 'backdrop'
        | 'background-music';

    export type GameObjectID = 'Pizza' | 'Backdrop' | 'Worm';
}