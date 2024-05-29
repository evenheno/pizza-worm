function gameLoop() {
    updatePlayerPosition();
    render();
    requestAnimationFrame(gameLoop);
}

function render() {
    const width = canvas.width;
    const height = canvas.height;
    const halfHeight = height / 2;
    ctx.clearRect(0, 0, width, height);

    // Paint sky
    ctx.fillStyle = 'rgb(5,5,10)';
    ctx.fillRect(0, 0, width, halfHeight);

    // Paint the floor
    ctx.fillStyle = 'rgb(15,15,20)';
    ctx.fillRect(0, halfHeight, width, halfHeight);

    for (let i = 0; i < width; i++) {
        const angle = player.dir - player.fov / 2 + player.fov * (i / width);
        const { dist, hitX, hitY } = castRay(player.x, player.y, angle);
        const correctedDist = dist * Math.cos(angle - player.dir);
        const wallHeight = Math.min(halfHeight / correctedDist, height);
        const textureX = Math.floor(((hitX + hitY) % 1) * sprites.wall.width);
        const textureHeight = sprites.wall.height;

        const wallTop = Math.max(0, halfHeight - wallHeight / 2);
        const wallBottom = Math.min(height, halfHeight + wallHeight / 2);

        if (dist < 20) {
            ctx.drawImage(
                sprites.wall,
                textureX, 0, 1, textureHeight,
                i, wallTop,
                1, wallBottom - wallTop
            );
        }
    }

    // Render sprites (plants)
    sprites.forEach(sprite => renderSprite(sprite));
}

function renderSprite(sprite) {
    const dx = sprite.x - player.x;
    const dy = sprite.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angleToSprite = Math.atan2(dy, dx) - player.dir;
    const spriteScreenX = canvas.width / 2 + (angleToSprite * canvas.width / player.fov);
    const spriteSize = canvas.height / dist;

    if (Math.abs(angleToSprite) < player.fov / 2) {
        ctx.drawImage(
            imgWallTexture, spriteScreenX - spriteSize / 2,
            (canvas.height / 2) - spriteSize / 2,
            spriteSize, spriteSize
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

function updatePlayerPosition() {
    const moveSpeed = 0.05;
    const rotSpeed = 0.03;
    if (keys.ArrowUp) {
        const newX = player.x + Math.cos(player.dir) * moveSpeed;
        const newY = player.y + Math.sin(player.dir) * moveSpeed;
        if (map[Math.floor(newY)][Math.floor(newX)] === "0") {
            player.x = newX;
            player.y = newY;
        }
    }
    if (keys.ArrowDown) {
        const newX = player.x - Math.cos(player.dir) * moveSpeed;
        const newY = player.y - Math.sin(player.dir) * moveSpeed;
        if (map[Math.floor(newY)][Math.floor(newX)] === "0") {
            player.x = newX;
            player.y = newY;
        }
    }
    if (keys.ArrowLeft) {
        player.dir -= rotSpeed;
    }
    if (keys.ArrowRight) {
        player.dir += rotSpeed;
    }
}

