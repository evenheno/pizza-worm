import { GameApp } from "../game-app";
import { IInputAdapter } from "../types/input-adapter.interface";
import { BaseManager } from "./base-manager";

export class InputManager extends BaseManager {
    private adapters: Map<string, IInputAdapter> = new Map();

    constructor(game: GameApp){
        super(game);
      }

    addInputAdapter(id: string, adapter: IInputAdapter): void {
        this.adapters.set(id, adapter);
    }

    removeInputAdapter(id: string): void {
        this.adapters.delete(id);
    }

    getInputState(inputType: string): boolean {
        const adapters = Array.from(this.adapters.values());
        for (const adapter of adapters) {
            if (adapter.getInputState(inputType)) return true;
        }
        return false;
    }
}