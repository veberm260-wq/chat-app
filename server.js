const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

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

// Главная — лента
app.get('/sw.js', (req, res) => res.sendFile(path.join(__dirname, 'public', 'sw.js')));
app.get('/manifest.json', (req, res) => res.sendFile(path.join(__dirname, 'public', 'manifest.json')));

app.get('/user', (req, res) => res.sendFile(path.join(__dirname, 'public', 'user.html')));
app.get('/user.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'user.html')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === FCM Push Endpoint ===
app.post('/api/send-push', async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: 'token, title и body обязательны' });
  }

  // ВАЖНО: Замени на свой Server Key (Legacy) из Firebase Console
  // Firebase Console → Project Settings → Cloud Messaging → Server key (Legacy)
  const serverKey = 'YOUR_FCM_SERVER_KEY_HERE';

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${serverKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title: title,
          body: body,
          icon: '/icon-180.png'
        },
        data: {
          click_action: '/messages.html'
        }
      })
    });

    const result = await response.json();
    console.log('FCM response:', result);

    res.json({ success: true, result });
  } catch (error) {
    console.error('FCM send error:', error);
    res.status(500).json({ error: 'Failed to send push' });
  }
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});