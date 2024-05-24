export interface IGameEvent<T> {
    type: string;
    data: T;
}