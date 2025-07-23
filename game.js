const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 12;
const PADDLE_MARGIN = 18;
const PLAYER_X = PADDLE_MARGIN;
const AI_X = WIDTH - PADDLE_WIDTH - PADDLE_MARGIN;
const PADDLE_SPEED = 6; // AI paddle speed

// Game state
let playerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let aiY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let ball = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  dx: Math.random() > 0.5 ? 4 : -4,
  dy: (Math.random() * 4 - 2)
};
let playerScore = 0;
let aiScore = 0;

// Mouse control for left paddle
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  // Clamp paddle inside canvas
  playerY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, playerY));
});

// Draw everything
function draw() {
  // Clear
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Net
  ctx.strokeStyle = '#fff';
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);

  // Paddles
  ctx.fillStyle = '#fff';
  ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

// Collision detection
function checkCollision(paddleX, paddleY) {
  // Paddle rectangle
  return (
    ball.x + BALL_RADIUS > paddleX &&
    ball.x - BALL_RADIUS < paddleX + PADDLE_WIDTH &&
    ball.y + BALL_RADIUS > paddleY &&
    ball.y - BALL_RADIUS < paddleY + PADDLE_HEIGHT
  );
}

// Update game logic
function update() {
  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Top and bottom wall collision
  if (ball.y - BALL_RADIUS < 0 || ball.y + BALL_RADIUS > HEIGHT) {
    ball.dy = -ball.dy;
    ball.y = Math.max(BALL_RADIUS, Math.min(HEIGHT - BALL_RADIUS, ball.y));
  }

  // Left paddle collision
  if (checkCollision(PLAYER_X, playerY)) {
    ball.dx = Math.abs(ball.dx);
    // add some "spin" based on contact point
    let hitPos = (ball.y - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    ball.dy = hitPos * 4;
    ball.x = PLAYER_X + PADDLE_WIDTH + BALL_RADIUS;
  }

  // Right paddle (AI) collision
  if (checkCollision(AI_X, aiY)) {
    ball.dx = -Math.abs(ball.dx);
    let hitPos = (ball.y - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    ball.dy = hitPos * 4;
    ball.x = AI_X - BALL_RADIUS;
  }

  // Score check
  if (ball.x - BALL_RADIUS < 0) {
    aiScore += 1;
    resetBall();
  } else if (ball.x + BALL_RADIUS > WIDTH) {
    playerScore += 1;
    resetBall();
  }

  // AI movement: follow the ball with some delay
  let aiCenter = aiY + PADDLE_HEIGHT / 2;
  if (aiCenter < ball.y - 10) {
    aiY += PADDLE_SPEED;
  } else if (aiCenter > ball.y + 10) {
    aiY -= PADDLE_SPEED;
  }
  // Clamp AI paddle
  aiY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, aiY));

  // Update scores
  document.getElementById('playerScore').textContent = playerScore;
  document.getElementById('aiScore').textContent = aiScore;
}

// Reset ball after score
function resetBall() {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  ball.dx = (Math.random() > 0.5 ? 4 : -4) * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = (Math.random() * 4 - 2);
}

// Main loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();