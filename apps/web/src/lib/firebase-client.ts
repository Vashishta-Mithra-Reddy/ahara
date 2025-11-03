import { initializeApp, getApps } from "firebase/app";
import {
	getMessaging,
	getToken,
	onMessage,
	isSupported,
} from "firebase/messaging";

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // made optional
};

export async function initFirebaseMessaging() {
	// Ensure we're in the browser environment
	if (typeof window === "undefined" || typeof navigator === "undefined")
		return null;

	const supported = await isSupported().catch(() => false);
	if (!supported) return null;

	const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
	const messaging = getMessaging(app);

	onMessage(messaging, async (payload) => {
		console.log("[FCM] foreground message:", payload);

		// Show notification for foreground messages when permission is granted
		if (Notification.permission === "granted") {
			try {
				const registration = await navigator.serviceWorker.ready;
				const title =
					payload.notification?.title || payload.data?.title || "Ahara";
				const body =
					payload.notification?.body ||
					payload.data?.body ||
					"You have a new notification";
				const icon = payload.notification?.icon || "/favicon.ico";
				const url =
					payload.fcmOptions?.link || payload.data?.url || "/dashboard";

				await registration.showNotification(title, {
					body,
					icon,
					data: {
						url,
						action: payload.data?.action || "default",
						...payload.data,
					},
				});
			} catch (error) {
				console.error("[FCM] Failed to show foreground notification:", error);
			}
		}
	});

	return messaging;
}

export async function getWebPushToken(
	registration?: ServiceWorkerRegistration,
) {
	// Ensure we're in the browser environment
	if (typeof window === "undefined") return null;

	const messaging = await initFirebaseMessaging();
	if (!messaging) return null;
	const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!;
	return await getToken(messaging, {
		vapidKey,
		serviceWorkerRegistration: registration,
	});
}
