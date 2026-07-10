// RAWWMART - Firebase Notification Helper
// Include this script in vendor and supplier pages

const VAPID_KEY = "BD9MRC4oJkRFaXTazDoVCBC6MZPKW_TXZl_3cAWfQ37uWF7pF7Hq9kIDkkOe0pGDV-f26E1vT_x4a0_JZyL2mtQ";
const BACKEND   = "https://rawwmart-backend.onrender.com";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBCE-4Oj8PSZAQpAZLgcgpVJIa-AyYNHO8",
  authDomain: "rawwmart-e339f.firebaseapp.com",
  projectId: "rawwmart-e339f",
  storageBucket: "rawwmart-e339f.firebasestorage.app",
  messagingSenderId: "830352769661",
  appId: "1:830352769661:web:f34430c4790a3fb0be6714"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

const app       = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ── Request permission and get FCM token ──
async function initNotifications(userToken) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service worker registered');

    // Get FCM token
    const fcmToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (fcmToken) {
      console.log('FCM Token obtained:', fcmToken.substring(0, 20) + '...');
      // Save token to backend
      await saveFCMToken(fcmToken, userToken);
    }

    // Handle foreground notifications
    onMessage(messaging, (payload) => {
      console.log('Foreground notification:', payload);
      showInAppNotification(payload.notification.title, payload.notification.body);
    });

  } catch (err) {
    console.log('Notification setup error:', err.message);
  }
}

// ── Save FCM token to backend ──
async function saveFCMToken(fcmToken, userToken) {
  try {
    await fetch(`${BACKEND}/api/notifications/save-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ fcmToken })
    });
    console.log('FCM token saved to backend');
  } catch (err) {
    console.log('Could not save FCM token:', err.message);
  }
}

// ── Show in-app toast notification ──
function showInAppNotification(title, body) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    background: #1DB954; color: white;
    padding: 14px 20px; border-radius: 12px;
    font-family: 'Outfit', sans-serif; font-size: 14px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    max-width: 300px; animation: slideIn 0.3s ease;
  `;
  toast.innerHTML = `<strong>🔔 ${title}</strong><br/><span style="font-size:12px;opacity:0.9;">${body}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

export { initNotifications, showInAppNotification };