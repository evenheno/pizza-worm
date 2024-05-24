import { IGameEvent } from "../types/game-event.interface";
import { GameObject } from "./game-object";
import { BaseRenderer } from "../renderers/base-renderer";

export class Scene {
  private name: string;
  private gameObjects: Map<string, GameObject>;

  constructor(name: string) {
    this.name = name;
    this.gameObjects = new Map();
  }

  public addGameObject(id: string, gameObject: GameObject): void {
    this.gameObjects.set(id, gameObject);
  }

  public removeGameObject(id: string): void {
    this.gameObjects.delete(id);
  }

  public onUpdate(deltaTime: number): void {
    this.gameObjects.forEach((gameObject) => {
      gameObject.onUpdate(deltaTime);
    });
  }

  public onDraw(renderer: BaseRenderer): void {
    this.gameObjects.forEach((gameObject) => {
      gameObject.onDraw(renderer);
    });
  }

  public onInit(): void {
    // Initialize the scene
  }

  public onDestroy(): void {
    // Cleanup the scene
  }

  public handleEvent<T>(event: IGameEvent<T>): void {
    this.gameObjects.forEach((gameObject) => {
      gameObject.handleEvent(event);
    });
  }
}