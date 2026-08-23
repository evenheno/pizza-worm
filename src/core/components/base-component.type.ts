import { BaseComponent } from "./base-component";

export type TComponent<TResourceID extends string = string, TGameObjectID extends string = string> =
	new (...args: any[]) => BaseComponent<TResourceID, TGameObjectID>;