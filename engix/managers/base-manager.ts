import { Game } from "../obj/game";

export class BaseManager {
    protected game: Game;
    constructor(game: Game) {
        this.game = game;
    }
}