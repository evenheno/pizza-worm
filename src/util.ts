import { TDomIds } from "./types";

export namespace Util {
    export function getElement<T = unknown>(id: TDomIds) {
        return document.getElementById(id) as T;
    }
}