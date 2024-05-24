export class Gfx {
    data: HTMLImageElement | string;
    width: number;
    height: number;
    borderColor: string;
    fillColor: string;
    rotation: number;
    opacity: number;

    constructor(
        data: HTMLImageElement | string,
        width: number,
        height: number,
        borderColor: string = '',
        fillColor: string = '',
        rotation: number = 0,
        opacity: number = 1
    ) {
        this.data = data;
        this.width = width;
        this.height = height;
        this.borderColor = borderColor;
        this.fillColor = fillColor;
        this.rotation = rotation;
        this.opacity = opacity;
    }
}