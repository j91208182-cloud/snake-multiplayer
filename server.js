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

// ✅ Fallback to index.html so "/" works
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Register
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (users[username]) return res.status(400).send("User already exists");

  const hash = bcrypt.hashSync(password, 10);
  users[username] = { password: hash, stats: { wins:

