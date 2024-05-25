import { BaseRenderer } from "../renderers/base-renderer";
import { Scene } from "../obj/scene";
import { BaseManager } from "./base-manager";

export class SceneManager extends BaseManager {
    private scenes: Map<string, Scene> = new Map();
    private currentScene: Scene | null = null;

    addScene(id: string, scene: Scene): void {
        this.scenes.set(id, scene);
    }

    setScene(id: string): void {
        this.currentScene = this.scenes.get(id) || null;
    }

    onUpdate(deltaTime: number): void {
        this.currentScene?.onUpdate(deltaTime);
    }

    onDraw(renderer: BaseRenderer): void {
        this.currentScene?.onDraw(renderer);
    }
}