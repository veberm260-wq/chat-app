const CACHE = 'costax-v2';
const ASSETS = ['/', '/login', '/messages.html', '/profile.html', '/user.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return Promise.allSettled(ASSETS.map(url => c.add(url).catch(() => {})));
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Push Notification Handler
self.addEventListener('push', event => {
  const data = event.data.json();
  const title = data.title || 'Новое сообщение';
  const options = {
    body: data.body || '',
    icon: '/icon-180.png',
    badge: '/icon-180.png',
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/messages.html')
  );
});
