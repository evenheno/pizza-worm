import { ComponentBase } from "../components/component-base";
import { GfxComponent } from "../components/component-gfx";
import { GameApp } from "../game-app";
import { BaseRenderer } from "../renderers/base-renderer";
import { IGameEvent } from "../types";
import { BaseManager } from "./base-manager";

export class ComponentManager extends BaseManager {
  private _components: { [id: string]: ComponentBase };

  constructor(game: GameApp, components?: { id: string, component: ComponentBase }[]) {
    super(game);
    this._components = {};
    components?.forEach(({ id, component }) => this.addComponent(id, component));
  }

  addComponent<T extends ComponentBase>(id: string, component: T): void {
    this._components[id] = component;
  }

  getComponent<T extends ComponentBase>(type: new () => T): T | undefined {
    for (const component of Object.values(this._components)) {
      if (component instanceof type) {
        return component as T;
      }
    }
    return undefined;
  }

  getComponentById<T extends ComponentBase>(id: string): T {
    return this._components[id] as T;
  }

  onDraw(renderer: BaseRenderer): void {
    for (const component of Object.values(this._components)) {
      if (component instanceof GfxComponent) {
        component.onDraw(renderer);
      }
    }
  }

  onUpdate(deltaTime: number): void {
    for (const component of Object.values(this._components)) {
      component.onUpdate(deltaTime);
    }
  }

  handleEvent<T>(event: IGameEvent<T>): void {
    for (const component of Object.values(this._components)) {
      component.handleEvent(event);
    }
  }
}