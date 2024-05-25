import { Constants } from "./constants";
import { TDomIds } from "./types";

export namespace Util {
    export function getElement<T = unknown>(id: TDomIds) {
        return document.getElementById(id) as T;
    }

    /**
 * Generate gradient colors between the specified colors
 * @param {number} steps - The total number of segments in the worm
 * @returns {string[]} - An array of gradient colors
 */
    export function generateGradientColors(steps: number): string[] {
        const colors = Constants.WORM_COLORS;
        const gradientColors = [];

        const interpolateColor = (color1: string, color2: string, factor: number): string => {
            const hex = (x: number) => x.toString(16).padStart(2, '0');
            const r1 = parseInt(color1.substring(1, 3), 16);
            const g1 = parseInt(color1.substring(3, 5), 16);
            const b1 = parseInt(color1.substring(5, 7), 16);
            const r2 = parseInt(color2.substring(1, 3), 16);
            const g2 = parseInt(color2.substring(3, 5), 16);
            const b2 = parseInt(color2.substring(5, 7), 16);

            const r = Math.round(r1 + factor * (r2 - r1));
            const g = Math.round(g1 + factor * (g2 - g1));
            const b = Math.round(b1 + factor * (b2 - b1));

            return `#${hex(r)}${hex(g)}${hex(b)}`;
        };

        for (let i = 0; i < steps; i++) {
            const t = i / (steps - 1);
            const colorIndex = Math.floor(t * (colors.length - 1));
            const factor = (t * (colors.length - 1)) % 1;
            gradientColors.push(interpolateColor(colors[colorIndex], colors[colorIndex + 1] || colors[colorIndex], factor));
        }

        return gradientColors;
    }
}