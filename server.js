const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const bcrypt = require("bcrypt");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 10000;

// Load or create users.json
let users = {};
const USERS_FILE = "./users.json";
if (fs.existsSync(USERS_FILE)) {
  users = JSON.parse(fs.readFileSync(USERS_FILE));
}

// Middleware
app.use(express.static("public"));
app.use(express.json());

// ✅ Fallback for homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Register endpoint
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Missing fields");
  if (users[username]) return res.status(400).send("User already exists");

  const hash = bcrypt.hashSync(password, 10);
  users[username] = { password: hash, stats: { wins: 0, losses: 0 } };
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.send("Account created!");
});

// Login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!users[username]) return res.status(400).send("User not found");

  const valid = bcrypt.compareSync(password, users[username].password);
  if (!valid) return res.status(400).send("Invalid password");

  res.send("Login successful!");
});

// Socket.IO
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("A player disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
