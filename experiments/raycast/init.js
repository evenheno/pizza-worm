let canvas;
let ctx;

const map = [
    ["1", "1", "1", "1", "1"],
    ["1", "0", "0", "0", "1"],
    ["1", "P", "X", "P", "1"],
    ["1", "0", "0", "0", "1"],
    ["1", "0", "1", "1", "1"],
    ["1", "0", "1", "0", "1"],
    ["1", "0", "1", "P", "1"],
    ["1", "1", "1", "0", "1"],
    ["1", "0", "0", "0", "1"],
    ["1", "0", "0", "0", "1"],
    ["1", "1", "1", "1", "1"]
];
const MA_WIDTH = map[0].length;
const MAP_HEIGHT = map.length;

const player = { x: 2.5, y: 2.5, dir: Math.PI / 4, fov: Math.PI / 3 };
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Shift: false };
let sprites = { wall: undefined, plant: undefined }

const loadImage = async (resourceUrl) => {
    return new Promise((resolve) => {
        const image = new Image();
        image.src = resourceUrl;
        image.onload = () => {
            console.log('Resource loaded');
            resolve(image);
        };
        image.onerror = (error) => {
            throw Error(`Failed to load image: ${error}`)
        };
    });
}

const getContainer = () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");
}

function initEvents() {
    document.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
        if (e.key === 'Shift') keys.Shift = true;
    });

    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
        if (e.key === 'Shift') keys.Shift = false;
    });

    document.addEventListener('keydown', (event) => {
        if (event.key in keys) {
            keys[event.key] = true;
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key in keys) {
            keys[event.key] = false;
        }
    });
}

async function initialize() {
    sprites = {
        wall: await loadImage('wall.gif'),
        plant: await loadImage('plant.gif')
    }

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            // Position player
            if (map[y][x] === "X") {
                player.x = x + 0.5;
                player.y = y + 0.5;
                map[y][x] = "0";
            }
            // Position plants
            if (map[y][x] === "P") {
                sprites = { x: x + 0.5, y: y + 0.5 };
            }
        }
    }

    requestAnimationFrame(gameLoop);
}

async function main() {
    console.log('Starting initialize method..');
    await initialize();
}

window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM finished.');
    main();
});