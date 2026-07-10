// RAWWMART - Firebase Service Worker
// This file runs in the background and handles push notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBCE-4Oj8PSZAQpAZLgcgpVJIa-AyYNHO8",
  authDomain: "rawwmart-e339f.firebaseapp.com",
  projectId: "rawwmart-e339f",
  storageBucket: "rawwmart-e339f.firebasestorage.app",
  messagingSenderId: "830352769661",
  appId: "1:830352769661:web:f34430c4790a3fb0be6714"
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('Background notification received:', payload);

  const { title, body, icon } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: icon || '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: payload.data,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('https://rawwmart.vercel.app/supplier-dashboard.html')
    );
  }
});