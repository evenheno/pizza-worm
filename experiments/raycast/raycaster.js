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
    const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

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
                return t;
            }
        }
        return 20;
    }

    function canMoveTo(x, y) {
        const cx = Math.floor(x);
        const cy = Math.floor(y);
        return cx >= 0 && cy >= 0 && cx < mapWidth && cy < mapHeight && map[cy][cx] === "0";
    }

    function updatePlayerPosition() {
        const moveSpeed = 0.03;
        const turnSpeed = 0.04;

        let newX = player.x;
        let newY = player.y;

        if (keys.ArrowUp) {
            newX += Math.cos(player.dir) * moveSpeed;
            newY += Math.sin(player.dir) * moveSpeed;
        }
        if (keys.ArrowDown) {
            newX -= Math.cos(player.dir) * moveSpeed;
            newY -= Math.sin(player.dir) * moveSpeed;
        }
        if (keys.ArrowLeft) {
            player.dir -= turnSpeed;
        }
        if (keys.ArrowRight) {
            player.dir += turnSpeed;
        }

        if (canMoveTo(newX, newY)) {
            player.x = newX;
            player.y = newY;
        }
    }

    async function render() {
        const width = canvas.width;
        const height = canvas.height;
        const halfHeight = height / 2;
        context.clearRect(0, 0, width, height);

        // Paint the ceiling in light blue
        context.fillStyle = 'lightblue';
        context.fillRect(0, 0, width, halfHeight);

        // Paint the floor
        context.fillStyle = 'gray';
        context.fillRect(0, halfHeight, width, halfHeight);

        for (let i = 0; i < width; i++) {
            const angle = player.dir + player.fov * (i / width - 0.5);
            const dist = castRay(player.x, player.y, angle);
            const wallHeight = Math.min(halfHeight / dist, height);
            const colorIntensity = 255 / (1 + dist);
            context.fillStyle = `rgb(${colorIntensity}, ${colorIntensity / 2}, ${colorIntensity / 2})`;
            context.fillRect(i, halfHeight - wallHeight / 2, 1, wallHeight);
        }
    }

    function gameLoop() {
        updatePlayerPosition();
        render();
        requestAnimationFrame(gameLoop);
    }

    document.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
    });

    initializePlayer();
    requestAnimationFrame(gameLoop);
});
