"use client";
import React, { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BellRing, Settings, Check, XCircle } from "lucide-react";
import ReminderSettings from "./ReminderSettings";
import EditTriggers from "./EditTriggers";
import { getWebPushToken } from "@/lib/firebase-client";

interface TrackingItem {
	id: string;
	name: string;
	category: string;
	type?: string;
	unit?: string;
}

type SettingsTabProps = {
	userTrackingItems: TrackingItem[];
};

export default function SettingsTab({ userTrackingItems }: SettingsTabProps) {
	// Push notifications state
	const [pushSupported, setPushSupported] = useState(false);
	const [permission, setPermission] = useState<NotificationPermission>("default");
	const [isRegistering, setIsRegistering] = useState(false);
	const [tokenRegistered, setTokenRegistered] = useState<boolean | null>(null);

	useEffect(() => {
		const supported =
			typeof window !== "undefined" &&
			"Notification" in window &&
			"serviceWorker" in navigator;
		setPushSupported(supported);
		if (supported) {
			setPermission(Notification.permission);
		}
	}, []);

	const enableNotifications = async () => {
		try {
			if (!pushSupported) {
				toast.error("Notifications are not supported in this browser.");
				return;
			}
			setIsRegistering(true);

			// Request permission if not granted
			if (Notification.permission !== "granted") {
				const perm = await Notification.requestPermission();
				setPermission(perm);
				if (perm !== "granted") {
					toast.error("Permission denied. Enable notifications from browser settings.");
					return;
				}
			}

			// Get SW registration and FCM token
			const registration = await navigator.serviceWorker.ready;
			const token = await getWebPushToken(registration);
			if (!token) {
				toast.error("Failed to obtain a push token. Please reload and try again.");
				setTokenRegistered(false);
				return;
			}

			// Register token with backend
			const deviceName = (typeof navigator !== "undefined" && navigator.userAgent) ? navigator.userAgent : "Web";
			const res = await fetch("/api/push/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, platform: "web", deviceName }),
			});

			if (!res.ok) {
				const msg = await res.text().catch(() => "");
				throw new Error(msg || `Registration failed (HTTP ${res.status})`);
			}
			setTokenRegistered(true);
			toast.success("Notifications enabled! You’ll now receive reminders.");
		} catch (err) {
			console.error("[Notifications] enable failed:", err);
			setTokenRegistered(false);
			toast.error("Could not enable notifications. Try again later.");
		} finally {
			setIsRegistering(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Push Notifications - placed at the very top */}
			<Card className="shadow-none hover:shadow-md transition-all duration-500">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BellRing className="h-5 w-5" />
						Push Notifications
					</CardTitle>
					<CardDescription>
						Enable push notifications to receive timely daily log and symptom check reminders.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between p-4 bg-muted/50 border border-muted rounded-lg">
						<div className="space-y-1">
							<p className="text-sm">
								Status:{" "}
								<span className="font-medium">
									{pushSupported ? "Supported" : "Not Supported"}
								</span>
							</p>
							<p className="text-sm">
								Permission:{" "}
								<span className="font-medium capitalize">{permission}</span>
							</p>
							{tokenRegistered !== null && (
								<p className="text-sm flex items-center gap-1">
									Token:{" "}
									{tokenRegistered ? (
										<>
											<Check className="h-4 w-4 text-green-600" /> registered
										</>
									) : (
										<>
											<XCircle className="h-4 w-4 text-red-600" /> not registered
										</>
									)}
								</p>
							)}
						</div>
						<div>
							<Button
								onClick={enableNotifications}
								disabled={
									isRegistering ||
									!pushSupported ||
									(permission === "denied") ||
									(tokenRegistered === true && permission === "granted")
								}
							>
								{isRegistering
									? "Enabling..."
									: permission === "granted" && tokenRegistered
										? "Enabled"
										: "Enable Notifications"}
							</Button>
							{permission === "denied" && (
								<p className="mt-2 text-xs text-muted-foreground">
									Notifications are blocked. Allow them in your browser’s site settings.
								</p>
							)}
						</div>
					</div>
					<p className="text-xs text-muted-foreground">
						We’ll only send reminders you configure below. You can change these times anytime.
					</p>
				</CardContent>
			</Card>

			{/* Existing settings card */}
			<Card className="shadow-none hover:shadow-md transition-all duration-500">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						Settings
					</CardTitle>
					<CardDescription>
						Manage your preferences and tracking items
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="p-4 bg-muted/50 border border-muted rounded-lg">
							<h3 className="font-medium mb-2">Active Tracking Items</h3>
							<p className="text-sm text-muted-foreground mb-3">
								You're currently tracking {userTrackingItems.length} items
							</p>
							<div className="flex flex-wrap gap-2">
								{userTrackingItems.map((item) => (
									<Badge key={item.id} variant="secondary">
										{item.name}
									</Badge>
								))}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* New settings sections */}
			<ReminderSettings />
			<EditTriggers />
		</div>
	);
}
