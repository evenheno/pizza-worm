import { BaseComponent } from "./base-component";
import { PositionComponent } from "./position.component";
import { ResourceComponent } from "./resource.component";

export type TComponent = typeof BaseComponent | typeof PositionComponent | typeof ResourceComponent;