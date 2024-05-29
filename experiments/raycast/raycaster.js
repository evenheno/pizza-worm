function gameLoop() {
    updatePlayerPosition();
    render();
    requestAnimationFrame(gameLoop);
}

function initializePlayer() {
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            if (map[y][x] === "X") {
                player.x = x + 0.5;
                player.y = y + 0.5;
                map[y][x] = "0";
                return;
            }
        }
    }
}

function render() {
    const width = canvas.width;
    const height = canvas.height;
    const halfHeight = height / 2;
    ctx.clearRect(0, 0, width, height);

    //Paint sky
    ctx.fillStyle = 'rgb(5,5,10)';
    ctx.fillRect(0, 0, width, halfHeight);

    //Paint the floor
    ctx.fillStyle = 'rgb(15,15,20)';
    ctx.fillRect(0, halfHeight, width, halfHeight);

    for (let i = 0; i < width; i++) {
        const angle = player.dir - player.fov / 2 + player.fov * (i / width);
        const { dist, hitX, hitY } = castRay(player.x, player.y, angle);
        const correctedDist = dist * Math.cos(angle - player.dir);
        const wallHeight = Math.min(halfHeight / correctedDist, height);
        const textureX = Math.floor(((hitX + hitY) % 1) * wallImage.width);
        const textureHeight = sprites.wall.height;

        const wallTop = Math.max(0, halfHeight - wallHeight / 2);
        const wallBottom = Math.min(height, halfHeight + wallHeight / 2);

        if (dist < 20) {
            ctx.drawImage(
                wallImage, textureX, 0, 1, textureHeight, i,
                wallTop, 1, wallBottom - wallTop);
        }
    }

    renderSprite();
}

function renderSprite() {
    const dx = sprite.x - player.x;
    const dy = sprite.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angleToSprite = Math.atan2(dy, dx) - player.dir;
    const spriteScreenX = canvas.width / 2 + (angleToSprite * canvas.width / player.fov);
    const spriteSize = canvas.height / dist;

    if (Math.abs(angleToSprite) < player.fov / 2) {
        ctx.drawImage(
            imgWallTexture,
            spriteScreenX - spriteSize / 2,
            (canvas.height / 2) - spriteSize / 2,
            spriteSize,
            spriteSize
        );
    }
}

function castRay(x, y, angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    for (let t = 0; t < 20; t += 0.01) {
        const cx = Math.floor(x + cos * t);
        const cy = Math.floor(y + sin * t);
        if (cx < 0 || cy < 0 || cx >= mapWidth || cy >= mapHeight || map[cy][cx] === "1") {
            return { dist: t, hitX: x + cos * t, hitY: y + sin * t };
        }
    }
    return { dist: 20, hitX: x + cos * 20, hitY: y + sin * 20 };
}
