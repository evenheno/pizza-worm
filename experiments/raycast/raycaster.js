window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    const map = [
        ["1", "1", "1", "1", "1"],
        ["1", "0", "0", "0", "1"],
        ["1", "0", "X", "0", "1"],
        ["1", "0", "0", "0", "1"],
        ["1", "0", "1", "1", "1"],
        ["1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1"],
        ["1", "1", "1", "0", "1"],
        ["1", "0", "0", "0", "1"],
        ["1", "0", "0", "0", "1"],
        ["1", "1", "1", "1", "1"]
    ];
    const mapWidth = map[0].length;
    const mapHeight = map.length;

    let player = { x: 2.5, y: 2.5, dir: Math.PI / 4, fov: Math.PI / 3 };
    const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Shift: false };

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

    function canMoveTo(x, y) {
        const cx = Math.floor(x);
        const cy = Math.floor(y);
        return cx >= 0 && cy >= 0 && cx < mapWidth && cy < mapHeight && map[cy][cx] === "0";
    }

    function updatePlayerPosition() {
        const moveSpeed = 0.03;
        const turnSpeed = 0.04;
        const strafeSpeed = 0.03;

        let newX = player.x;
        let newY = player.y;

        if (keys.ArrowUp) {
            if (keys.Shift) {
                newX += Math.cos(player.dir - Math.PI / 2) * strafeSpeed;
                newY += Math.sin(player.dir - Math.PI / 2) * strafeSpeed;
            } else {
                newX += Math.cos(player.dir) * moveSpeed;
                newY += Math.sin(player.dir) * moveSpeed;
            }
        }
        if (keys.ArrowDown) {
            if (keys.Shift) {
                newX -= Math.cos(player.dir - Math.PI / 2) * strafeSpeed;
                newY -= Math.sin(player.dir - Math.PI / 2) * strafeSpeed;
            } else {
                newX -= Math.cos(player.dir) * moveSpeed;
                newY -= Math.sin(player.dir) * moveSpeed;
            }
        }
        if (keys.ArrowLeft) {
            if (keys.Shift) {
                newX -= Math.cos(player.dir + Math.PI / 2) * strafeSpeed;
                newY -= Math.sin(player.dir + Math.PI / 2) * strafeSpeed;
            } else {
                player.dir -= turnSpeed;
            }
        }
        if (keys.ArrowRight) {
            if (keys.Shift) {
                newX += Math.cos(player.dir + Math.PI / 2) * strafeSpeed;
                newY += Math.sin(player.dir + Math.PI / 2) * strafeSpeed;
            } else {
                player.dir += turnSpeed;
            }
        }

        if (canMoveTo(newX, newY)) {
            player.x = newX;
            player.y = newY;
        }
    }

    const wallImage = new Image();
    wallImage.src = 'wall.gif';
    wallImage.onload = () => {
        requestAnimationFrame(gameLoop);
    };

    async function render() {
        const width = canvas.width;
        const height = canvas.height;
        const halfHeight = height / 2;
        context.clearRect(0, 0, width, height);

        // Paint sky
        context.fillStyle = 'rgb(5,5,10)';
        context.fillRect(0, 0, width, halfHeight);

        // Paint the floor
        context.fillStyle = 'rgb(15,15,20)';
        context.fillRect(0, halfHeight, width, halfHeight);

        for (let i = 0; i < width; i++) {
            const angle = player.dir + player.fov * (i / width - 0.5);
            const { dist, hitX } = castRay(player.x, player.y, angle);
            const wallHeight = Math.min(halfHeight / dist, height);
            const textureX = Math.floor((hitX % 1) * wallImage.width);
            const textureHeight = wallImage.height;

            // Calculate the top and bottom of the wall slice
            const wallTop = halfHeight - wallHeight / 2;
            const wallBottom = halfHeight + wallHeight / 2;

            // Draw wall with texture
            if (dist < 20) {
                context.drawImage(
                    wallImage,
                    textureX, 0, 1, textureHeight,
                    i, wallTop,
                    1, wallBottom - wallTop
                );
            }
        }
    }

    function gameLoop() {
        updatePlayerPosition();
        render();
        requestAnimationFrame(gameLoop);
    }

    document.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
        if (e.key === 'Shift') keys.Shift = true;
    });

    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
        if (e.key === 'Shift') keys.Shift = false;
    });

    initializePlayer();
});
