
const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
        gl_Position = a_position;
        v_texCoord = a_texCoord;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    void main() {
        gl_FragColor = texture2D(u_texture, v_texCoord);
    }
`;

const map = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
];

const TILE_SIZE = 64;
const NUM_RAYS = 320;
const FOV = Math.PI / 3;
const HALF_FOV = FOV / 2;
const MAX_DEPTH = TILE_SIZE * 8;

class Raycaster {
    constructor(posX, posY, angle) {
        this.posX = posX;
        this.posY = posY;
        this.angle = angle;
    }

    castRay(angle) {
        let rayX = this.posX;
        let rayY = this.posY;
        let distance = 0;

        while (distance < MAX_DEPTH) {
            rayX += Math.cos(angle);
            rayY += Math.sin(angle);
            distance++;

            const mapX = Math.floor(rayX / TILE_SIZE);
            const mapY = Math.floor(rayY / TILE_SIZE);

            if (map[mapY][mapX] === 1) {
                const textureX = rayX % TILE_SIZE;
                return { angle, distance, hitX: rayX, hitY: rayY, textureX };
            }
        }

        return { angle, distance: MAX_DEPTH, hitX: rayX, hitY: rayY, textureX: 0 };
    }

    castRays() {
        const rays = [];
        const startAngle = this.angle - HALF_FOV;
        const angleStep = FOV / NUM_RAYS;

        for (let i = 0; i < NUM_RAYS; i++) {
            const rayAngle = startAngle + i * angleStep;
            rays.push(this.castRay(rayAngle));
        }

        return rays;
    }

    moveForward(distance) {
        this.posX += Math.cos(this.angle) * distance;
        this.posY += Math.sin(this.angle) * distance;
    }

    moveBackward(distance) {
        this.posX -= Math.cos(this.angle) * distance;
        this.posY -= Math.sin(this.angle) * distance;
    }

    turnLeft(angle) {
        this.angle -= angle;
    }

    turnRight(angle) {
        this.angle += angle;
    }
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function main() {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');
    const positionBuffer = gl.createBuffer();
    const texCoordBuffer = gl.createBuffer();

    const textureManager = new TextureManager(gl);
    const resources = {
        wall: 'wall-texture.png',
        // Add more textures here
    };

    textureManager.loadTextures(resources).then(() => {
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = new Float32Array(NUM_RAYS * 6);

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        const texCoords = new Float32Array(NUM_RAYS * 6);

        const raycaster = new Raycaster(128, 128, Math.PI / 4);

        function render() {
            const rays = raycaster.castRays();
            for (let i = 0; i < NUM_RAYS; i++) {
                const ray = rays[i];
                const distance = ray.distance;
                const wallHeight = (TILE_SIZE * canvas.height) / distance;
                const wallTop = (canvas.height - wallHeight) / 2;
                const wallBottom = wallTop + wallHeight;

                const x = (i / NUM_RAYS) * canvas.width;

                positions[i * 6 + 0] = x;
                positions[i * 6 + 1] = wallTop;
                positions[i * 6 + 2] = x;
                positions[i * 6 + 3] = wallBottom;
                positions[i * 6 + 4] = x + (canvas.width / NUM_RAYS);
                positions[i * 6 + 5] = wallBottom;

                const texCoordX = ray.textureX / TILE_SIZE;
                texCoords[i * 6 + 0] = texCoordX;
                texCoords[i * 6 + 1] = 0;
                texCoords[i * 6 + 2] = texCoordX;
                texCoords[i * 6 + 3] = 1;
                texCoords[i * 6 + 4] = texCoordX + (1 / NUM_RAYS);
                texCoords[i * 6 + 5] = 1;
            }

            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
            gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(program);

            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(texCoordAttributeLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            const wallTexture = textureManager.getTexture('wall');
            if (wallTexture) {
                gl.bindTexture(gl.TEXTURE_2D, wallTexture);
                gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
            }

            gl.drawArrays(gl.TRIANGLES, 0, NUM_RAYS * 2);
        }

        function update() {
            render();
            requestAnimationFrame(update);
        }

        update();

        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'w':
                    raycaster.moveForward(5);
                    break;
                case 's':
                    raycaster.moveBackward(5);
                    break;
                case 'a':
                    raycaster.turnLeft(Math.PI / 32);
                    break;
                case 'd':
                    raycaster.turnRight(Math.PI / 32);
                    break;
            }
        });
    });
}

class TextureManager {
    constructor(gl) {
        this.gl = gl;
        this.textures = new Map();
    }

    loadTexture(url, key) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = url;
            image.onload = () => {
                const texture = this.createTexture(image);
                this.textures.set(key, texture);
                resolve();
            };
            image.onerror = reject;
        });
    }

    loadTextures(resources) {
        const promises = Object.keys(resources).map(key =>
            this.loadTexture(resources[key], key)
        );
        return Promise.all(promises);
    }

    getTexture(key) {
        return this.textures.get(key);
    }

    removeTexture(key) {
        this.textures.delete(key);
    }

    createTexture(image) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

        return texture;
    }
}

main();
