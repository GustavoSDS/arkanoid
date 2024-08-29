
// Variables globales para el juego
const FONT = '16px system-ui, -apple-system, sans-serif';
let score = 0;
let lives = 3;
let gameStarted = false;
const WIDTH = 450;
const HEIGHT = 400;

// Elementos del DOM
const SCORE_ELEMENT = document.querySelector('#score');
const HOME_CONTAINER = document.querySelector('#home');
const BRICKS_IMAGE = document.querySelector('#bricks');
const SPRITE_IMAGE = document.querySelector('#sprite');

document.getElementById('startButton').addEventListener('click', startGame);
function startGame() {
    if (gameStarted) return; // Evita que el juego se inicie más de una vez
    gameStarted = true;
    
    CANVAS.style.display = 'block';
    HOME_CONTAINER.remove();
    initEvents();
    draw();
}

const CANVAS = document.querySelector('canvas');
const CONTEXT = CANVAS.getContext('2d');
CANVAS.width = WIDTH;
CANVAS.height = HEIGHT;

// Variables para la pelota
const BALL_RADIUS = 5;  // Radio de la pelota
let ballX = WIDTH / 2; // Posición inicial de la pelota (en el centro del canvas)
let ballY = HEIGHT - 30; // Posición inicial de la pelota (cerca del borde inferior)
let ballSpeedX = 2; // Velocidad en x de la pelota
let ballSpeedY = -2; // Velocidad en y de la pelota (ahora positivo para moverse hacia abajo)
let ballColor = 'white';

// Variables para el jugador (paleta)
const PADDLE_WIDTH = 46;
const PADDLE_HEIGHT = 12;
let paddleX = WIDTH / 2 - PADDLE_WIDTH / 2; // Ajuste para centrar el paddle
let paddleY = HEIGHT - PADDLE_HEIGHT - 8; // Ajuste para estar en la parte inferior del canvas
let paddleSpeed = 8;
let rightPressed = false;
let leftPressed = false;

// Variables para los bloques
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 26;
let brickX = WIDTH / 2 - BRICK_WIDTH / 2; // Ajuste para centrar el bloque
let brickY = HEIGHT / 4; // Ajustado para estar en una posición visible
let brickRows = 6; // Número de filas de bloques
let brickColumns = 8;
let brickPadding = -1;
let brickOffsetTop = 60;
let brickOffsetLeft = 30;
let bricks = []; // Array para almacenar los bloques
let brickRow = 0; // Fila actual de bloques
let brickColumn = 0; // Columna actual de bloques
const BRICK_STATUS = {
    ALIVE: 1,
    DEAD: 0
}

for (let col = 0; col < brickRows; col++) {
    bricks[col] = [];
    for (let fil = 0; fil < brickColumns; fil++) {
        const BRICK_X = brickOffsetLeft + (fil * (BRICK_WIDTH + brickPadding));
        const BRICK_Y = brickOffsetTop + (col * (BRICK_HEIGHT + brickPadding));
        const COLOR_RANDOM = getRandomNumber();

        bricks[col][fil] = { // Cada bloque tiene una propiedad status que indica si está vivo o muerto
            x: BRICK_X,
            y: BRICK_Y,
            status: BRICK_STATUS.ALIVE,
            color: COLOR_RANDOM
        };
    }
}

function drawBall() {
    CONTEXT.beginPath();
    CONTEXT.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    CONTEXT.fillStyle = ballColor;
    CONTEXT.fill();
    CONTEXT.closePath();
}

function drawPaddle() {
    CONTEXT.drawImage(
        SPRITE_IMAGE,
        31,
        174,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        paddleX,
        paddleY,
        PADDLE_WIDTH,
        PADDLE_HEIGHT
    );
}

function drawBricks() {
    for (let col = 0; col < brickRows; col++) {
        for (let fil = 0; fil < brickColumns; fil++) {
            if (bricks[col][fil].status === BRICK_STATUS.DEAD) continue; // Si el bloque está muerto, no dibujarlo
            const CURRENT_BRICK = bricks[col][fil];
            const CLIP_X = CURRENT_BRICK.x;
            const CLIP_Y = CURRENT_BRICK.y;
            const CLIP_WIDTH = BRICK_WIDTH;
            const CLIP_HEIGHT = BRICK_HEIGHT;
            CONTEXT.drawImage(
                BRICKS_IMAGE,
                CURRENT_BRICK.color * BRICK_WIDTH,
                2,
                BRICK_WIDTH,
                BRICK_HEIGHT,
                CLIP_X,
                CLIP_Y,
                CLIP_WIDTH,
                CLIP_HEIGHT
            );

        }
    }
}

function drawLives() {
    CONTEXT.font = FONT;
    CONTEXT.fillStyle = 'white';
    CONTEXT.fillText('Vidas: ' + lives, 8, 20);
}

function drawScore() {
    CONTEXT.font = FONT;
    CONTEXT.fillStyle = 'white';
    CONTEXT.fillText('Puntuación: ' + score, WIDTH - 110, 20);
}

function collisionDetection() {
    for (let col = 0; col < brickRows; col++) {
        for (let fil = 0; fil < brickColumns; fil++) {
            const CURRENT_BRICK = bricks[col][fil];
            if (CURRENT_BRICK.status === BRICK_STATUS.DEAD) continue;

            if (
                ballX > CURRENT_BRICK.x &&
                ballX < CURRENT_BRICK.x + BRICK_WIDTH &&
                ballY > CURRENT_BRICK.y &&
                ballY < CURRENT_BRICK.y + BRICK_HEIGHT
            ) {
                CURRENT_BRICK.status = BRICK_STATUS.DEAD;
                ballSpeedY = -ballSpeedY;
                score += 10;
            }
        }
    }
}

function ballMovement() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Detectar si la pelota ha chocado con la paleta
    if (
        ballX > paddleX &&
        ballX < paddleX + PADDLE_WIDTH &&
        ballY + BALL_RADIUS > paddleY &&
        ballY - BALL_RADIUS < paddleY + PADDLE_HEIGHT
    ) {
        ballSpeedY = -ballSpeedY;
        ballY = paddleY - BALL_RADIUS; // Ajusta la posición para que no quede dentro de la paleta
    }

    // Detectar si la pelota ha chocado con los muros laterales
    if (ballX + ballSpeedX > WIDTH - BALL_RADIUS || ballX + ballSpeedX < BALL_RADIUS) {
        ballSpeedX = -ballSpeedX;
    }

    // Detectar si la pelota ha chocado con el techo
    if (ballY + ballSpeedY < BALL_RADIUS) {
        ballSpeedY = -ballSpeedY;
    }
    // Detectar si la pelota ha chocado con el muro inferior
    else if (ballY + ballSpeedY > HEIGHT - BALL_RADIUS) {
        // En lugar de recargar la página, puedes reiniciar la posición de la pelota
        if (lives === 1) {
            gameOver();
        }
        lives--; // Restar una vida
        ballX = WIDTH / 2;
        ballY = HEIGHT - 30;
        ballSpeedX = 2;
        ballSpeedY = -2;
    }
}

function paddleMovement() {
    if (rightPressed && paddleX < WIDTH - PADDLE_WIDTH - 2) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 2) {
        paddleX -= paddleSpeed;
    }
}

function initEvents() {
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    function keyDownHandler(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            rightPressed = true;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
            leftPressed = true;
        }
    }

    function keyUpHandler(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            rightPressed = false;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
            leftPressed = false;
        }
    }
}

function gameOver() {
    if (lives === 1) {
        alert('Game Over');
        ballSpeedX = 2;
        ballSpeedY = -2;
        document.location.reload();
    }
}

function youWin() {
    if (score === brickRows * brickColumns * 10) {
        alert('You Win!');
        document.location.reload();
    }
    console.log(score);
}

function draw() {
    CONTEXT.clearRect(0, 0, WIDTH, HEIGHT); // Limpiar la pantalla antes de dibujar

    // Dibujar los elementos del juego en la pantalla
    drawLives();
    drawScore();
    drawBall();
    drawPaddle();
    drawBricks();

    // Colisiones con el muro y el borde de la pantalla
    collisionDetection();
    ballMovement();
    paddleMovement();
    youWin();

    // Se ejecuta en cada frame de la animación de 60 fps o depende de la velocidad de los frames
    window.requestAnimationFrame(draw);
}

function getRandomNumber() {
    return Math.floor(Math.random() * 6);
}