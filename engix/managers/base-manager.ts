import { GameApp } from "../game-app";

export class BaseManager {
    protected app: GameApp;
    constructor(app: GameApp) {
        this.app = app;
    }
}