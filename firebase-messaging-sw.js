/* firebase-messaging-sw.js — recibe notificaciones push en segundo plano (FCM)
   RELLENA firebaseConfig con tus valores (mismos que en firebase-config.js).
*/
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

const firebaseConfig = {
  "apiKey": "AIzaSyA2HaGFibNh-nHeIX2i2mIQ5h2iGaeWsco",
  "authDomain": "planta-59ff8.firebaseapp.com",
  "projectId": "planta-59ff8",
  "storageBucket": "planta-59ff8.firebasestorage.app",
  "messagingSenderId": "185987714097",
  "appId": "1:185987714097:web:024cc87eb8372c52345910"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload)=>{
  const title = payload?.notification?.title || 'Recordatorio';
  const options = {
    body: payload?.notification?.body || '',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    data: { url: (payload?.data?.url || './') }
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event)=>{
  event.notification.close();
  const url = event.notification?.data?.url || './';
  event.waitUntil(clients.matchAll({type:'window', includeUncontrolled:true}).then(win=>{
    for(const c of win){ if (c.url.includes(url)) return c.focus(); }
    return clients.openWindow(url);
  }));
});
