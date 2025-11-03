"use client";

import { useEffect } from "react";
import { getWebPushToken } from "@/lib/firebase-client";

export default function PushNotificationsInit() {
	useEffect(() => {
		async function setup() {
			try {
				// Ensure we're in the browser environment
				if (typeof window === "undefined" || typeof navigator === "undefined")
					return;
				if (!("Notification" in window) || !("serviceWorker" in navigator))
					return;

				if (Notification.permission === "granted") {
					const registration = await navigator.serviceWorker.ready;
					const token = await getWebPushToken(registration);
					if (token) {
						await fetch("/api/push/register", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ token, platform: "web" }),
						});
					}
				}
			} catch (err) {
				console.error("[PushInit] Failed:", err);
			}
		}
		setup();
	}, []);

	return null;
}
