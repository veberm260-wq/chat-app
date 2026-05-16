const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;
const MESSAGES_FILE = path.join(__dirname, 'messages.json');
const MAX_MESSAGES = 200;

// Загрузка истории из файла
let messages = [];
try {
  if (fs.existsSync(MESSAGES_FILE)) {
    messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
  }
} catch (e) {
  messages = [];
}

function saveMessages() {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages), 'utf8');
  } catch (e) {}
}

// Статика
app.use(express.static(path.join(__dirname, 'public')));
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
// Онлайн пользователи: socketId → name
const onlineUsers = new Map();

io.on('connection', (socket) => {
  const name = socket.handshake.auth.name || 'Аноним';
  onlineUsers.set(socket.id, name);

  // Отправить историю новому пользователю
  socket.emit('history', messages);

  // Оповестить всех о входе
  io.emit('user_joined', { name });
  io.emit('online_count', onlineUsers.size);

  // Новое сообщение
  socket.on('send_message', ({ text }) => {
    if (!text || !text.trim()) return;
    const msg = {
      id: uuidv4(),
      sender: name,
      text: text.trim().slice(0, 2000),
      ts: Date.now()
    };
    messages.push(msg);
    if (messages.length > MAX_MESSAGES) messages = messages.slice(-MAX_MESSAGES);
    saveMessages();
    io.emit('new_message', msg);
  });

  // Отключение
  socket.on('disconnect', () => {
    const userName = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    io.emit('user_left', { name: userName });
    io.emit('online_count', onlineUsers.size);
  });
});

server.listen(PORT, () => {
  console.log(`Чат запущен: http://localhost:${PORT}`);
});
