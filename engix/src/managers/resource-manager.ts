import { GameApp } from "../game-app";
import { TResourcesMap } from "../types";
import { BaseManager } from "./base-manager";

export type TResource = HTMLImageElement;

export class ResourceManager extends BaseManager {

  private resources: { [id: string]: TResource } = {};

  constructor(game: GameApp) {
    super(game);
  }

  async preloadResources(resourceMap: TResourcesMap): Promise<void> {
    const loadPromises = Object.entries(resourceMap).map(([id, url]) => {
      return this.loadResource(id, url);
    });
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