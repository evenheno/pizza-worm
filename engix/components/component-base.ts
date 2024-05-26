import { IGameEvent } from "../types";

export abstract class ComponentBase {
    abstract id : string;
    abstract onInit(): void;
    abstract onUpdate(deltaTime: number): void;
    abstract onDestroy(): void;
    abstract handleEvent<T>(event: IGameEvent<T>): void;
}