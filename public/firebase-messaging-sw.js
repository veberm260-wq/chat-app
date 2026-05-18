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
  const { title, body } = payload.notification;
  self.registration.showNotification(title, { body, icon: '/favicon.svg' });
});