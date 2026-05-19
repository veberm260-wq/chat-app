const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Firebase Admin — необязательный, только если заданы переменные
let adminMessaging = null;
try {
  const admin = require('firebase-admin');
  if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
      })
    });
    adminMessaging = admin.messaging();
    console.log('Firebase Admin OK');
  } else {
    console.log('Firebase Admin — переменные не заданы, push отключены');
  }
} catch(e) {
  console.warn('Firebase Admin не запустился:', e.message);
}

// Маршруты
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'public', 'profile.html')));
app.get('/messages', (req, res) => res.sendFile(path.join(__dirname, 'public', 'messages.html')));
app.get('/user', (req, res) => res.sendFile(path.join(__dirname, 'public', 'user.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Push endpoint
app.post('/api/send-push', async (req, res) => {
  if (!adminMessaging) {
    return res.status(503).json({ error: 'Push не настроен' });
  }
  const { token, title, body } = req.body;
  if (!token || !title || !body) {
    return res.status(400).json({ error: 'token, title и body обязательны' });
  }
  try {
    const response = await adminMessaging.send({
      data: { title, body, click_action: '/messages.html' },
      android: { priority: 'high' },
      token
    });
    res.json({ success: true, messageId: response });
  } catch(e) {
    console.error('Push error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

server.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));
