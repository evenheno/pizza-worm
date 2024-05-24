import { Game } from "../obj/game";
import { BaseManager } from "./base-manager";

export class ResourceManager extends BaseManager {

  constructor(game: Game) {
    super(game);
  }

  private resources: { [id: string]: any } = {};

  async preloadResources(resourceMap: { [id: string]: string }): Promise<void> {
    const loadPromises = Object.entries(resourceMap).map(([id, url]) => this.loadResource(id, url));
    await Promise.all(loadPromises);
  }

  async loadResource(id: string, url: string): Promise<void> {
    const response = await fetch(url);
    const blob = await response.blob();
    const dataUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.src = dataUrl;
    await new Promise(resolve => (img.onload = resolve));
    this.resources[id] = img;
  }

  getResource(id: string): any {
    return this.resources[id];
  }

  clearResources(): void {
    this.resources = {};
  }
}