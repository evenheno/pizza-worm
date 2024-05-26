import { IInputAdapter } from "../types/input-adapter.interface";

export class KeyboardInputAdapter implements IInputAdapter {
    private keys: Set<string> = new Set();
  
    constructor() {
      window.addEventListener('keydown', (e) => this.keys.add(e.key));
      window.addEventListener('keyup', (e) => this.keys.delete(e.key));
    }
  
    getInputState(inputType: string): boolean {
      return this.keys.has(inputType);
    }
  }