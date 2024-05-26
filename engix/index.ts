import { GameApp as _GameApp } from './game-app';
import { GameObject as _GameObject } from './obj/game-object';
import { Scene as _Scene } from './obj/scene';
import * as _Components from './components';
import * as _Types from './types';
import * as _Renderers from './renderers/index';
import * as _Event from './types/game-event.type.ns'

export namespace EngiX {
    export const GameApp = _GameApp;
    export const GameObject = _GameObject;
    export const Scene = _Scene;
    export import Components = _Components;
    export import Renderers = _Renderers;
    export import Types = _Types;
    export import Event = _Event;
}