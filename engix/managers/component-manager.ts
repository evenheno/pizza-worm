import { ComponentBase } from "../components/component-base";
import { GfxComponent } from "../components/component-gfx";
import { Game } from "../obj/game";
import { BaseRenderer } from "../renderers/base-renderer";
import { IGameEvent } from "../types/game-event.interface";
import { BaseManager } from "./base-manager";

export class ComponentManager extends BaseManager {
    public components: { [id: string]: ComponentBase };
  
    constructor(game: Game, components?: { id: string, component: ComponentBase }[]) {
      super(game);
      this.components = {};
      components?.forEach(({ id, component }) => this.addComponent(id, component));
    }
  
    addComponent(id: string, component: ComponentBase): void {
      this.components[id] = component;
    }
  
    getComponent<T extends ComponentBase>(type: new () => T): T | undefined {
      for (const component of Object.values(this.components)) {
        if (component instanceof type) {
          return component as T;
        }
      }
      return undefined;
    }
  
    getComponentById<T extends ComponentBase>(id: string): T {
      return this.components[id] as T;
    }
  
    onDraw(renderer: BaseRenderer): void {
      for (const component of Object.values(this.components)) {
        if (component instanceof GfxComponent) {
          component.onDraw(renderer);
        }
      }
    }
  
    onUpdate(deltaTime: number): void {
      for (const component of Object.values(this.components)) {
        component.onUpdate(deltaTime);
      }
    }
  
    handleEvent<T>(event: IGameEvent<T>): void {
      for (const component of Object.values(this.components)) {
        component.handleEvent(event);
      }
    }
  }