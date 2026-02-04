// Service Worker para notificaciones Firebase
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBkufXohT8hySrtjdG_wCbNy621BktYPlU",
  authDomain: "notis-3fb7b.firebaseapp.com",
  projectId: "notis-3fb7b",
  storageBucket: "notis-3fb7b.firebasestorage.app",
  messagingSenderId: "631638349358",
  appId: "1:631638349358:web:0580f2872af14bd38871bf"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener instancia de Messaging
const messaging = firebase.messaging();

// Manejar notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('Notificación recibida en segundo plano:', payload);
  
  const notificationTitle = payload.notification.title || 'Nueva notificación';
  const notificationOptions = {
    body: payload.notification.body || 'Tienes una nueva actualización',
    icon: payload.notification.icon || '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: 'tarea-notification',
    requireInteraction: false,
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('Click en notificación:', event);
  
  event.notification.close();
  
  // Abrir o enfocar la aplicación
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si hay una ventana abierta, enfocarla
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('/') && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
