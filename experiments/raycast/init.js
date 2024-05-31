
let canvas;
let context;

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

const MAP_WIDTH = map[0].length;
const MAP_HEIGHT = map.length;

const player = { x: 2.5, y: 2.5, direction: Math.PI / 4, fieldOfView: Math.PI / 3 };
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Shift: false };
let textures = { wall: undefined, plant: undefined };
let sprites = [];

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
        textures.plant = await loadImage('sprites/plant.gif');

        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                if (map[y][x] === 'X') {
                    player.x = x + 0.5;
                    player.y = y + 0.5;
                    map[y][x] = '0';
                } else if (map[y][x] === 'P') {
                    sprites.push({ x: x + 0.5, y: y + 0.5 });
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
    const tolerance = 0.1; // Small tolerance to prevent floating-point precision issues
    const mapX = Math.floor(x);
    const mapY = Math.floor(y);
    const cell = map[mapY] && map[mapY][mapX];
    
    // Check if the target position is within a free cell with some tolerance for floating-point precision
    return cell === '0' && 
           mapY >= 0 && mapY < MAP_HEIGHT && 
           mapX >= 0 && mapX < MAP_WIDTH && 
           (x - mapX > tolerance && x - mapX < 1 - tolerance) && 
           (y - mapY > tolerance && y - mapY < 1 - tolerance);
};

const updatePlayerPosition = () => {
    const moveSpeed = 0.05;
    const rotationSpeed = 0.03;

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
    for (let t = 0; t < 20; t += 0.01) {
        const cellX = Math.floor(x + cos * t);
        const cellY = Math.floor(y + sin * t);
        if (cellX < 0 || cellY < 0 || cellX >= MAP_WIDTH || cellY >= MAP_HEIGHT || map[cellY][cellX] === '1') {
            return { distance: t, hitX: x + cos * t, hitY: y + sin * t };
        }
    }
    return { distance: 20, hitX: x + cos * 20, hitY: y + sin * 20 };
};

const render = () => {
    const width = canvas.width;
    const height = canvas.height;
    const halfHeight = height / 2;

    context.clearRect(0, 0, width, height);

    // Paint sky
    context.fillStyle = 'rgb(5, 5, 10)';
    context.fillRect(0, 0, width, halfHeight);

    // Paint floor
    context.fillStyle = 'rgb(15, 15, 20)';
    context.fillRect(0, halfHeight, width, halfHeight);

    // Render walls
    for (let i = 0; i < width; i++) {
        const angle = player.direction - player.fieldOfView / 2 + player.fieldOfView * (i / width);
        const { distance, hitX, hitY } = castRay(player.x, player.y, angle);
        const correctedDistance = distance * Math.cos(angle - player.direction);
        const wallHeight = Math.min(halfHeight / correctedDistance, height);
        const textureX = Math.floor(((hitX + hitY) % 1) * textures.wall.width);
        const textureHeight = textures.wall.height;

        const wallTop = Math.max(0, halfHeight - wallHeight / 2);
        const wallBottom = Math.min(height, halfHeight + wallHeight / 2);

        if (distance < 20) {
            context.drawImage(
                textures.wall,
                textureX, 0, 1, textureHeight,
                i, wallTop,
                1, wallBottom - wallTop
            );
        }
    }

    // Render sprites
    renderSprites();
};

const renderSprites = () => {
    // Sort sprites by distance from player (farthest to closest)
    sprites.sort((a, b) => {
        const distA = Math.sqrt((a.x - player.x) ** 2 + (a.y - player.y) ** 2);
        const distB = Math.sqrt((b.x - player.x) ** 2 + (b.y - player.y) ** 2);
        return distB - distA;
    });

    sprites.forEach(sprite => {
        const dx = sprite.x - player.x;
        const dy = sprite.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angleToSprite = Math.atan2(dy, dx) - player.direction;
        const spriteScreenX = canvas.width / 2 + (angleToSprite * canvas.width / player.fieldOfView);
        const spriteSize = canvas.height / distance;

        if (Math.abs(angleToSprite) < player.fieldOfView / 2) {
            const startX = Math.max(0, Math.floor(spriteScreenX - spriteSize / 2));
            const endX = Math.min(canvas.width, Math.floor(spriteScreenX + spriteSize / 2));

            context.drawImage(
                textures.plant,
                startX,
                (canvas.height / 2) - spriteSize / 2,
                spriteSize,
                spriteSize
            );
        }
    });
};
