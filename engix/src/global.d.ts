import { EngiX } from ".";

declare global {
    interface Window {
        EngiX: typeof EngiX;
    }
}