const socket = io();

const authScreen = document.getElementById("authScreen");
const gameScreen = document.getElementById("gameScreen");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const authMessage = document.getElementById("authMessage");
const welcomeText = document.getElementById("welcomeText");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let snake, food, dx, dy, score;
let username = "";

// Auth
registerBtn.onclick = async () => {
  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
  });
  authMessage.textContent = await res.text();
};

loginBtn.onclick = async () => {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
  });
  if (res.ok) {
    const data = await res.json();
    username = usernameInput.value;
    authScreen.style.display = "none";
    gameScreen.style.display = "block";
    welcomeText.textContent = `Welcome, ${username}!`;
    startGame();
  } else {
    authMessage.textContent = await res.text();
  }
};

// Game
function startGame() {
  snake = [{ x: 200, y: 200 }];
  food = randomFood();
  dx = 20; dy = 0;
  score = 0;
  document.addEventListener("keydown", changeDirection);
  setInterval(updateGame, 100);
}

function updateGame() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    food = randomFood();
  } else {
    snake.pop();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "green";
  snake.forEach(p => ctx.fillRect(p.x, p.y, 20, 20));
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, 20, 20);
}

function changeDirection(e) {
  if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -20; }
  if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 20; }
  if (e.key === "ArrowLeft" && dx === 0) { dx = -20; dy = 0; }
  if (e.key === "ArrowRight" && dx === 0) { dx = 20; dy = 0; }
}

function randomFood() {
  return {
    x: Math.floor(Math.random() * 20) * 20,
    y: Math.floor(Math.random() * 20) * 20
  };
}
