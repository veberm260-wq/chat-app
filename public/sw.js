importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCeveXncaJYszckdflfTVWCDc0AwNilR9k",
  authDomain: "costax-aed53.firebaseapp.com",
  projectId: "costax-aed53",
  storageBucket: "costax-aed53.firebasestorage.app",
  messagingSenderId: "747179946604",
  appId: "1:747179946604:web:073d7faf7d80fb40041e49"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title || 'Новое сообщение';
  const body = payload.data?.body || '';
  self.registration.showNotification(title, { body, icon: '/favicon.svg', data: payload.data });
});

const CACHE = 'costax-v4';
const ASSETS = ['/'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(url => c.add(url).catch(() => {}))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    ])
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) {
          client.focus();
          client.navigate('/#/messages');
          return;
        }
      }
      return clients.openWindow('/#/messages');
    })
  );
});
