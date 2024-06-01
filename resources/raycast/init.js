let canvas;
let context;

const map = [
    ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"],
    ["1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1"],
    ["1", "0", "1", "1", "1", "1", "0", "1", "1", "1", "1", "0", "1"],
    ["1", "0", "1", "0", "0", "0", "0", "0", "1", "0", "0", "0", "1"],
    ["1", "0", "1", "0", "1", "1", "1", "0", "1", "0", "0", "0", "1"],
    ["1", "0", "1", "0", "1", "0", "0", "0", "1", "0", "X", "0", "1"],
    ["1", "0", "1", "1", "1", "0", "1", "1", "1", "1", "1", "0", "1"],
    ["1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1"],
    ["1", "0", "1", "1", "1", "1", "1", "0", "1", "1", "1", "1", "1"],
    ["1", "0", "1", "0", "0", "0", "0", "0", "1", "0", "0", "0", "1"],
    ["1", "0", "1", "0", "1", "1", "1", "1", "1", "0", "1", "0", "1"],
    ["1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1"],
    ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"]
];

const MAP_WIDTH = map[0].length;
const MAP_HEIGHT = map.length;

const player = { x: 2.5, y: 2.5, direction: Math.PI / 4, fieldOfView: Math.PI / 3 };
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Shift: false };
let textures = { wall: undefined };
let gameObjects = [];
let wallTextureData = [];

const loadImage = (url) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    });
};

const setupCanvas = () => {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
};

const setupEventListeners = () => {
    document.addEventListener('keydown', (event) => {
        if (event.key in keys) keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        if (event.key in keys) keys[event.key] = false;
    });
};

const initialize = async () => {
    try {
        textures.wall = await loadImage('sprites/wall.gif');
        const textureCanvas = document.createElement('canvas');
        const textureContext = textureCanvas.getContext('2d');
        textureCanvas.width = textures.wall.width;
        textureCanvas.height = textures.wall.height;
        textureContext.drawImage(textures.wall, 0, 0);
        const textureImageData = textureContext.getImageData(0, 0, textures.wall.width, textures.wall.height);
        wallTextureData = textureImageData.data;

        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                if (map[y][x] === 'X') {
                    player.x = x + 0.5; player.y = y + 0.5; map[y][x] = '0';
                } else if (map[y][x] === '1') {
                    gameObjects.push({
                        x: x, y: y, width: 1, height: 1,
                        rotation: 0, texture: textures.wall
                    });
                }
            }
        }
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error(error.message);
    }
};

const main = async () => {
    setupCanvas();
    setupEventListeners();
    await initialize();
};

window.addEventListener('DOMContentLoaded', main);

const gameLoop = () => {
    updatePlayerPosition();
    render();
    requestAnimationFrame(gameLoop);
};

const canMoveTo = (x, y) => {
    const mapX = Math.floor(x);
    const mapY = Math.floor(y);
    const cell = map[mapY] && map[mapY][mapX];

    return cell === '0' &&
        mapY >= 0 && mapY < MAP_HEIGHT &&
        mapX >= 0 && mapX < MAP_WIDTH;
};

const updatePlayerPosition = () => {
    const moveSpeed = 0.03;
    const rotationSpeed = 0.027;

    if (keys.ArrowUp) {
        const newX = player.x + Math.cos(player.direction) * moveSpeed;
        const newY = player.y + Math.sin(player.direction) * moveSpeed;
        if (canMoveTo(newX, newY)) {
            player.x = newX;
            player.y = newY;
        }
    }
    if (keys.ArrowDown) {
        const newX = player.x - Math.cos(player.direction) * moveSpeed;
        const newY = player.y - Math.sin(player.direction) * moveSpeed;
        if (canMoveTo(newX, newY)) {
            player.x = newX;
            player.y = newY;
        }
    }
    if (keys.ArrowLeft) {
        if (keys.Shift) {  // Strafe left
            const newX = player.x + Math.cos(player.direction - Math.PI / 2) * moveSpeed;
            const newY = player.y + Math.sin(player.direction - Math.PI / 2) * moveSpeed;
            if (canMoveTo(newX, newY)) {
                player.x = newX;
                player.y = newY;
            }
        } else {
            player.direction -= rotationSpeed;
        }
    }
    if (keys.ArrowRight) {
        if (keys.Shift) {  // Strafe right
            const newX = player.x + Math.cos(player.direction + Math.PI / 2) * moveSpeed;
            const newY = player.y + Math.sin(player.direction + Math.PI / 2) * moveSpeed;
            if (canMoveTo(newX, newY)) {
                player.x = newX;
                player.y = newY;
            }
        } else {
            player.direction += rotationSpeed;
        }
    }
};

const castRay = (x, y, angle) => {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    for (let t = 0; t < 5; t += 0.01) {
        const cellX = Math.floor(x + cos * t);
        const cellY = Math.floor(y + sin * t);
        if (cellX < 0 || cellY < 0 || cellX >= MAP_WIDTH || cellY >= MAP_HEIGHT || map[cellY][cellX] === '1') {
            return { distance: t, hitX: x + cos * t, hitY: y + sin * t };
        }
    }
};

const render = () => {
    const width = canvas.width;
    const height = canvas.height;
    const halfHeight = height / 2;

    context.clearRect(0, 0, width, height);

    // Create an ImageData object for the entire canvas
    const imageData = context.createImageData(width, height);
    const data = imageData.data;

    // Paint sky
    for (let y = 0; y < halfHeight; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            data[index] = 5; // R
            data[index + 1] = 5; // G
            data[index + 2] = 10; // B
            data[index + 3] = 255; // A
        }
    }

    // Paint floor
    for (let y = halfHeight; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            data[index] = 15; // R
            data[index + 1] = 15; // G
            data[index + 2] = 20; // B
            data[index + 3] = 255; // A
        }
    }

    // Render walls
    for (let i = 0; i < width; i++) {
        const angle = player.direction - player.fieldOfView / 2 + player.fieldOfView * (i / width);
        const castRayResult = castRay(player.x, player.y, angle);

        if (!castRayResult) continue;
        const { distance, hitX, hitY } = castRayResult;
        const correctedDistance = distance * Math.cos(angle - player.direction);
        const wallHeight = Math.min(halfHeight / correctedDistance, height);

        const textureHeight = textures.wall.height;
        const textureWidth = textures.wall.width;
        const textureX = Math.floor(((hitX % 1) + (hitY % 1)) * textureWidth) % textureWidth;

        const wallTop = Math.max(0, halfHeight - wallHeight / 2);
        const wallBottom = Math.min(height, halfHeight + wallHeight / 2);

        // Draw the wall pixel by pixel using ImageData
        for (let y = wallTop; y < wallBottom; y++) {
            const textureY = Math.floor((y - wallTop) / (wallBottom - wallTop) * textureHeight);
            const pixelIndex = (textureY * textureWidth + textureX) * 4;
            const r = wallTextureData[pixelIndex];
            const g = wallTextureData[pixelIndex + 1];
            const b = wallTextureData[pixelIndex + 2];
            const a = wallTextureData[pixelIndex + 3];

            const canvasIndex = (y * width + i) * 4;
            data[canvasIndex] = r;
            data[canvasIndex + 1] = g;
            data[canvasIndex + 2] = b;
            data[canvasIndex + 3] = a;
        }
    }

    // Put the ImageData back to the canvas
    context.putImageData(imageData, 0, 0);
};

main();


