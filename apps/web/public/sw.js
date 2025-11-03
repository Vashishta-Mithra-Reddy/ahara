// Firebase Messaging (background) - uses compat for SW
importScripts(
	"https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js",
);
importScripts(
	"https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js",
);

try {
	firebase.initializeApp({
		apiKey: "AIzaSyD5pydsVtD_hBuoXNIExZoLTHBx2RMleH0",
		authDomain: "ahara-v19.firebaseapp.com",
		projectId: "ahara-v19",
		storageBucket: "ahara-v19.firebasestorage.app",
		messagingSenderId: "1090258091947",
		appId: "1:1090258091947:web:600c502fd552a791ac9cee",
		measurementId: "G-KKHYTM9ZKG",
	});

	const messaging = firebase.messaging();
	messaging.onBackgroundMessage((payload) => {
		console.log("[SW] Background message received:", payload);

		// Only manually show notification if FCM didn't auto-display it
		// FCM auto-displays when payload has 'notification' property
		if (!payload.notification) {
			const title = payload?.data?.title || "Ahara";
			const body = payload?.data?.body || "You have a reminder";
			const data = payload?.data || {};
			const url = payload?.fcmOptions?.link || data?.url || "/dashboard";

			self.registration.showNotification(title, {
				body,
				icon: "/favicon.ico",
				badge: "/icons/ahara-512.png",
				data: { ...data, url },
			});
		}
	});
	console.log("[SW] Firebase messaging initialized");
} catch (e) {
	console.warn("[SW] Firebase init failed:", e);
}

const CACHE_VERSION = "ahara-v1";
const APP_SHELL = [
	"/",
	"/manifest.json",
	"/favicon.ico",
	"/icons/ahara-192.png",
	"/icons/ahara-512.png",
];

self.addEventListener("install", (event) => {
	self.skipWaiting();
	event.waitUntil(
		caches
			.open(CACHE_VERSION)
			.then((cache) => cache.addAll(APP_SHELL))
			.catch(() => null),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys.map((key) =>
						key !== CACHE_VERSION ? caches.delete(key) : undefined,
					),
				),
			),
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	if (url.origin !== self.location.origin) return;
	if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth"))
		return;

	const isStaticAsset =
		/\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/.test(url.pathname);

	if (isStaticAsset) {
		event.respondWith(
			caches.match(request).then((cached) => {
				const fetchPromise = fetch(request)
					.then((response) => {
						const copy = response.clone();
						caches
							.open(CACHE_VERSION)
							.then((cache) => cache.put(request, copy));
						return response;
					})
					.catch(
						() =>
							cached ||
							fetch(request).catch(() => new Response(null, { status: 504 })),
					);
				return cached || fetchPromise;
			}),
		);
		return;
	}

	event.respondWith(
		fetch(request).catch(() =>
			caches
				.match(request)
				.then((cached) => cached || new Response(null, { status: 504 })),
		),
	);
});

self.addEventListener("notificationclick", (event) => {
	console.log("[SW] Notification clicked:", event.notification.data);
	event.notification.close();

	const data = event.notification.data || {};
	let url = data.url || "/dashboard";

	// Handle specific actions
	if (data.action === "log") {
		url = "/dashboard?tab=food-log";
	} else if (data.action === "reflection") {
		url = "/dashboard?tab=reflection";
	}

	event.waitUntil(
		self.clients
			.matchAll({ type: "window", includeUncontrolled: true })
			.then((clientsArr) => {
				// Check if there's already a window open with the target URL
				for (const client of clientsArr) {
					if (client.url === url && "focus" in client) {
						return client.focus();
					}
				}
				// If no matching window found, check for any dashboard window
				for (const client of clientsArr) {
					if (client.url.includes("/dashboard") && "focus" in client) {
						client.navigate(url);
						return client.focus();
					}
				}
				// No suitable window found, open a new one
				return self.clients.openWindow(url);
			}),
	);
});

// self.addEventListener("push", (event) => {
//   const data = (() => {
//     try {
//       return event.data ? event.data.json() : {};
//     } catch {
//       return {};
//     }
//   })();

//   const title =
//     data?.notification?.title ||
//     data?.data?.title ||
//     "Ahara Reminder";

//   const body =
//     data?.notification?.body ||
//     data?.data?.body ||
//     "You have a new reminder";

//   const icon =
//     data?.notification?.icon ||
//     data?.data?.icon ||
//     "/icons/ahara-192.png";

//   const url =
//     data?.notification?.click_action ||
//     data?.data?.url ||
//     "/dashboard";

//   const options = {
//     body,
//     icon,
//     badge: "/icons/ahara-192.png",
//     data: { url },
//   };

//   // Optional debug — viewable in SW console
//   console.log("[SW] push payload:", data);

//   event.waitUntil(self.registration.showNotification(title, options));
// });
