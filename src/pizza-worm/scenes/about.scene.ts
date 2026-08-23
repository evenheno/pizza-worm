import { Button, InputManager, ResourceManager, Scene, Text } from "../../core";
import { Constants } from "../pizza-worm.const";
import { Types } from "../pizza-worm.type";
import { PizzaWorm } from "../pizza-worm.app";

export class AboutScene extends Scene<Types.ResourceID, Types.GameObjectID> {
    public constructor(app: PizzaWorm) {
        super('about', app);
    }

    protected override onInitialize(resourceManager: ResourceManager<Types.ResourceID>): void {
        this.addObject('AboutTitle', new Text('AboutTitle', this.app, {
            content: Constants.APP_INFO.title,
            position: 'center',
            options: { offset: [0, -130], fontSize: 30, color: '#E7EEFF' }
        }));

        this.addObject('AboutVersion', new Text('AboutVersion', this.app, {
            content: `Version ${Constants.APP_INFO.version}`,
            position: 'center',
            options: { offset: [0, -92], fontSize: 14, color: '#89A2D6' }
        }));

        this.addObject('AboutDetails', new Text('AboutDetails', this.app, {
            content: Constants.APP_INFO.description,
            position: 'center',
            options: { offset: [0, -35], fontSize: 14, color: '#CAD5EC' }
        }));

        this.addObject('AboutAuthor', new Text('AboutAuthor', this.app, {
            content: `Author: ${Constants.APP_INFO.author}`,
            position: 'center',
            options: { offset: [0, 8], fontSize: 14, color: '#B5C2DF' }
        }));

        this.addObject('AboutLicense', new Text('AboutLicense', this.app, {
            content: `License: ${Constants.APP_INFO.license}`,
            position: 'center',
            options: { offset: [0, 34], fontSize: 14, color: '#B5C2DF' }
        }));

        this.addObject('BtnBack', new Button('BtnBack', this.app, {
            x: 20,
            y: 20,
            width: 132,
            height: 36,
            fontSize: 14,
            borderRadius: 9,
            borderWidth: 3,
            style: {
                background: '#1E2A3E',
                border: '#4B6FA8',
                text: '#ECF4FF',
                hoverBackground: '#27416A',
                hoverBorder: '#78B6FF',
                hoverText: '#FFFFFF',
                activeBackground: '#31558A',
                activeBorder: '#9CD4FF',
                activeText: '#FFFFFF',
                disabledBackground: '#151C29',
                disabledBorder: '#2E3E5C',
                disabledText: '#8799BC'
            },
            label: 'Back',
            onClick: () => this.app.switchScene('gameplay', { durationMs: 220, color: '#05070B' })
        }));
    }

    protected override onUpdate(inputManager: InputManager, deltaTime: number): void { }

    protected override onDraw(ctx: CanvasRenderingContext2D): void {
        const { width, height } = this.app.screen;
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0D111B');
        gradient.addColorStop(1, '#07090F');
        // Scene.onDraw runs after game objects, so draw the panel as a
        // destination-over layer to keep labels and buttons visible.
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }
}
