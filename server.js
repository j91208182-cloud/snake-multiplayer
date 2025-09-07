// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const bcrypt = require("bcrypt");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Load or create users.json
let users = {};
const USERS_FILE = "./users.json";
if (fs.existsSync(USERS_FILE)) {
  users = JSON.parse(fs.readFileSync(USERS_FILE));
}

// Middleware
app.use(express.static("public"));
app.use(express.json());

// Register endpoint
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (users[username]) return res.status(400).send("User already exists");

  const hash = bcrypt.hashSync(password, 10);
  users[username] = { password: hash, stats: { wins: 0, losses: 0 } };

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.send("Registered successfully");
});

// Login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user) return res.status(400).send("User not found");

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(400).send("Invalid password");

  res.json({ message: "Login successful", stats: user.stats });
});

// WebSockets
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
