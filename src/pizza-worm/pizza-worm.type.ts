import { CoreTypes } from "../core";

export namespace Types {

    export type StartOptions = {
        fullScreen?: boolean;
        onResourceLoadProgress?: (progress: CoreTypes.TResourceLoadProgress<ResourceID>) => void;
    }

    export type WormSegment = {
        x: number;
        y: number;
        color: string;
    };

    export type ResourceID =
        | `pizza-${string}`
        | 'backdrop'
        | 'background-music';

    export type GameObjectID =
        | 'Pizza'
        | 'PizzaParticles'
        | 'Backdrop'
        | 'Worm'
        | 'LoadingBar'
        | 'LoadingTitle'
        | 'LoadingSubtitle'
        | 'LoadingPercent'
        | 'LoadingProgressLabel'
        | 'LoadingTip'
        | 'BtnSound'
        | 'BtnMusic'
        | 'BtnPause'
        | 'BtnAbout'
        | 'BtnRestart'
        | 'BtnBack'
        | 'AboutTitle'
        | 'AboutVersion'
        | 'AboutDetails'
        | 'AboutAuthor'
        | 'AboutLicense';
    export type SceneID = 'loading' | 'gameplay' | 'about';
}
