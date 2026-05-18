require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const admin = require('firebase-admin');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Инициализация Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Статика из папки public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Маршруты
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/messages', (req, res) => res.sendFile(path.join(__dirname, 'public', 'messages.html')));

app.get('/messages.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'messages.html'));
});

app.get('/sw.js', (req, res) => res.sendFile(path.join(__dirname, 'public', 'sw.js')));
app.get('/manifest.json', (req, res) => res.sendFile(path.join(__dirname, 'public', 'manifest.json')));

app.get('/user', (req, res) => res.sendFile(path.join(__dirname, 'public', 'user.html')));
app.get('/user.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'user.html')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === FCM Push Endpoint (через Firebase Admin SDK) ===
app.post('/api/send-push', async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: 'token, title и body обязательны' });
  }

  try {
    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        click_action: '/messages.html',
      },
      token: token,
    };

    const response = await admin.messaging().send(message);
    console.log('Push отправлен успешно:', response);

    res.json({ success: true, messageId: response });
  } catch (error) {
    console.error('Ошибка отправки push:', error);
    res.status(500).json({ error: 'Failed to send push notification' });
  }
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});