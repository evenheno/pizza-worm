import { GameObject } from "../obj/game-object";

export interface IGameEvent<T> {
    type: string;
    data: T;
}

export namespace GameEvent {

    export namespace Payload {
        export type StartPayload = {};
        export type PausePayload = {};
        export type ResumePayload = {};
        export type QuitPayload = {};
        export type SceneChangePayload = { newScene: string };

        export type ObjectCollisionPayload = {
            source: GameObject;
            target: GameObject;
        };

        export type InputPayload = {
            inputType: string;
            isPressed: boolean;
        };

        export type AnimationCompletePayload = {
            animationId: string;
        };
    }

    export class Start implements IGameEvent<Payload.StartPayload> {
        type = 'GAME_START';
        data: Payload.StartPayload;

        constructor() {
            this.data = {};
        }
    }

    export class Pause implements IGameEvent<Payload.PausePayload> {
        type = 'GAME_PAUSE';
        data: Payload.PausePayload;

        constructor() {
            this.data = {};
        }
    }

    export class Resume implements IGameEvent<Payload.ResumePayload> {
        type = 'GAME_RESUME';
        data: Payload.ResumePayload;

        constructor() {
            this.data = {};
        }
    }

    export class Quit implements IGameEvent<Payload.QuitPayload> {
        type = 'GAME_QUIT';
        data: Payload.QuitPayload;

        constructor() {
            this.data = {};
        }
    }

    export class SceneChange implements IGameEvent<Payload.SceneChangePayload> {
        type = 'SCENE_CHANGE';
        data: Payload.SceneChangePayload;

        constructor(newScene: string) {
            this.data = { newScene };
        }
    }

    export class ObjectCollision implements IGameEvent<Payload.ObjectCollisionPayload> {
        type = 'OBJECT_COLLISION';
        data: Payload.ObjectCollisionPayload;

        constructor(source: GameObject, target: GameObject) {
            this.data = { source, target };
        }
    }

    export class Input implements IGameEvent<Payload.InputPayload> {
        type = 'INPUT_EVENT';
        data: Payload.InputPayload;

        constructor(inputType: string, isPressed: boolean) {
            this.data = { inputType, isPressed };
        }
    }

    export class AnimationComplete implements IGameEvent<Payload.AnimationCompletePayload> {
        type = 'ANIMATION_COMPLETE';
        data: Payload.AnimationCompletePayload;

        constructor(animationId: string) {
            this.data = { animationId };
        }
    }

    export class Custom<T> implements IGameEvent<T> {
        type = 'CUSTOM_EVENT';
        data: T;

        constructor(data: T) {
            this.data = data;
        }
    }
}
