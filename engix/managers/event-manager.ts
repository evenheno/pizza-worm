import { GameApp } from "../game-app";
import { BaseManager } from "./base-manager";

export class EventManager extends BaseManager{
  
  private events: { [event: string]: Function[] } = {};

  constructor(game: GameApp){
    super(game);
  }

  on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: Function): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
}