import { NextResponse } from "next/server";
import crypto from "crypto";
import {
	// Switched to auth-layer service wrappers
	getAllReminderSettingsForServiceRequest,
	getDailyCheckInByUserDateRangeForServiceRequest,
	createDailyCheckInForServiceRequest,
	updateDailyCheckInForServiceRequest,
	getUserByIdForServiceRequest,
	getPushTokensByUserForServiceRequest,
} from "@ahara/auth";
import { sendPushToToken, type PushPayload } from "@/lib/fcm";

function hhmmToMinutes(hhmm?: string): number {
	if (!hhmm) return 0;
	const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
	return (h % 24) * 60 + (m % 60);
}
function minutesToHhmm(total: number): string {
	const t = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
	const h = Math.floor(t / 60);
	const m = t % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function withinWindow(nowMin: number, startMin: number, endMin: number): boolean {
	if (startMin <= endMin) return nowMin >= startMin && nowMin <= endMin;
	return nowMin >= startMin || nowMin <= endMin; // wrap-around
}
function to12h(hhmm: string) {
	const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
	const mer = h >= 12 ? "PM" : "AM";
	const h12 = h % 12 === 0 ? 12 : h % 12;
	return `${h12}:${String(m).padStart(2, "0")} ${mer}`;
}
function formatLocalWindowLabel(startMin: number, endMin: number) {
	const sLocal = minutesToHhmm(startMin);
	const eLocal = minutesToHhmm(endMin);
	const sMer = sLocal.endsWith("00") ? to12h(sLocal).replace(":00 ", " ") : to12h(sLocal);
	const eMer = eLocal.endsWith("00") ? to12h(eLocal).replace(":00 ", " ") : to12h(eLocal);
	const sMerToken = sMer.split(" ").pop();
	const eMerToken = eMer.split(" ").pop();
	if (sMerToken === eMerToken) {
		return `${sMer.replace(/\s(AM|PM)$/, "")}–${eMer.replace(/\s(AM|PM)$/, "")} ${sMerToken}`;
	}
	return `${sMer}–${eMer}`;
}
function normalizeTime(t?: string) {
	if (!t) return "00:00";
	const parts = t.split(":");
	return `${(parts[0] ?? "00").padStart(2, "0")}:${(parts[1] ?? "00").padStart(2, "0")}`;
}
function getLocalParts(date: Date, timeZone: string) {
	const fmt = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
	const parts = fmt.formatToParts(date);
	const toNum = (t: string) => parseInt(parts.find((p) => p.type === t)?.value || "0", 10);
	const y = toNum("year");
	const m = toNum("month");
	const d = toNum("day");
	const h = toNum("hour");
	const min = toNum("minute");
	const sec = toNum("second");
	const tzTimeMs = Date.UTC(y, m - 1, d, h, min, sec);
	const offsetMin = Math.round((tzTimeMs - date.getTime()) / 60000);
	return { year: y, month: m, day: d, hour: h, minute: min, second: sec, offsetMin };
}

async function sendPushNotification(userId: string, payload: PushPayload, headers: any): Promise<boolean> {
	try {
		console.log(`[FCM] Attempting to send push notification to user ${userId}`);
		
		// Get all active push tokens for the user
		const tokens = await getPushTokensByUserForServiceRequest({
			headers,
			userId,
		});
		
		if (!tokens || tokens.length === 0) {
			console.log(`[FCM] No push tokens found for user ${userId}`);
			return false;
		}

		let successCount = 0;
		const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
		
		console.log(`[FCM] Found ${tokenArray.length} push token(s) for user ${userId}`);
		
		// Send to all user's devices
		for (const tokenRecord of tokenArray) {
			const token = (tokenRecord as any)?.token;
			if (token) {
				console.log(`[FCM] Sending to token: ${token.substring(0, 20)}...`);
				const success = await sendPushToToken(token, payload);
				if (success) {
					successCount++;
					console.log(`[FCM] ✅ Successfully sent to token: ${token.substring(0, 20)}...`);
				} else {
					console.warn(`[FCM] ❌ Failed to send to token: ${token.substring(0, 20)}...`);
				}
			} else {
				console.warn(`[FCM] Invalid token record for user ${userId}:`, tokenRecord);
			}
		}

		console.log(`[FCM] Sent push notification to ${successCount}/${tokenArray.length} devices for user ${userId}`);
		return successCount > 0;
	} catch (error) {
		console.error(`[FCM] Error sending push notification to user ${userId}:`, error);
		return false;
	}
}

// Fixed internal window durations
const LOG_WINDOW_MIN = 60;
const SYMPTOM_WINDOW_MIN = 60;

export async function GET(req: Request) {
	console.log("[PING] Starting ping request processing...");
	
	const authHeader = req.headers.get("authorization");
	const signature = req.headers.get("x-signature");
	const timestamp = req.headers.get("x-timestamp");

	const token = process.env.PING_BEARER_TOKEN;
	const signingSecret = process.env.PING_SIGNING_SECRET;

	// Enhanced environment variable checking
	if (!token) {
		console.error("[PING] PING_BEARER_TOKEN environment variable is not set");
		return NextResponse.json({ error: "Server configuration error: Missing bearer token" }, { status: 500 });
	}

	if (!signingSecret) {
		console.error("[PING] PING_SIGNING_SECRET environment variable is not set");
		return NextResponse.json({ error: "Server configuration error: Missing signing secret" }, { status: 500 });
	}

	// Enhanced authentication logging
	console.log("[PING] Auth header present:", !!authHeader);
	console.log("[PING] Signature present:", !!signature);
	console.log("[PING] Timestamp present:", !!timestamp);

	if (authHeader !== `Bearer ${token}`) {
		console.warn("[PING] Invalid bearer token provided");
		return NextResponse.json({ error: "Unauthorized: Invalid bearer token" }, { status: 401 });
	}

	const nowSec = Math.floor(Date.now() / 1000);
	if (!timestamp || Math.abs(nowSec - parseInt(timestamp)) > 60) {
		console.warn("[PING] Stale or missing timestamp. Now:", nowSec, "Provided:", timestamp);
		return NextResponse.json({ error: "Stale timestamp" }, { status: 400 });
	}

	const expected = crypto
		.createHmac("sha256", signingSecret)
		.update(timestamp)
		.digest("hex");
	if (signature !== expected) {
		console.warn("[PING] Invalid signature. Expected:", expected, "Received:", signature);
		return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
	}

	console.log("[PING] Authentication successful");

	console.log("[PING] Authentication successful");

	try {
		const settings = await getAllReminderSettingsForServiceRequest({
			headers: req.headers,
		});
		
		console.log(`[PING] Found ${settings.length} reminder settings to process`);
		
		const nowUtc = new Date();
		console.log(`[PING] Current UTC time: ${nowUtc.toISOString()}`);

		let sentLog = 0;
		let sentSymptom = 0;

		for (const s of settings) {
			const userId = (s as any).userId as string;
			const tz = ((s as any).timezone as string) || "UTC";

			console.log(`[PING] Processing user ${userId} in timezone ${tz}`);

			// Current local time (minutes since local midnight)
			const nowLocal = getLocalParts(nowUtc, tz);
			const nowMinLocal = nowLocal.hour * 60 + nowLocal.minute;

			console.log(`[PING] User ${userId} local time: ${nowLocal.hour}:${String(nowLocal.minute).padStart(2, '0')} (${nowMinLocal} minutes)`);

			// Local windows from settings
			const logStartMin = hhmmToMinutes(normalizeTime((s as any).logReminderTime ?? "20:00"));
			const logDuration = LOG_WINDOW_MIN;
			const logEndMin = (logStartMin + logDuration) % (24 * 60);

			const symptomStartMin = hhmmToMinutes(normalizeTime((s as any).symptomCheckTime ?? "22:00"));
			const symptomDuration = SYMPTOM_WINDOW_MIN;
			const symptomEndMin = (symptomStartMin + symptomDuration) % (24 * 60);

			console.log(`[PING] User ${userId} log window: ${minutesToHhmm(logStartMin)} - ${minutesToHhmm(logEndMin)}`);
			console.log(`[PING] User ${userId} symptom window: ${minutesToHhmm(symptomStartMin)} - ${minutesToHhmm(symptomEndMin)}`);

			// Compute user's local day bounds in UTC using timezone-aware offset
			const localMidnightBaseUtc = new Date(Date.UTC(nowLocal.year, nowLocal.month - 1, nowLocal.day, 0, 0, 0));
			const localMidnightOffset = getLocalParts(localMidnightBaseUtc, tz).offsetMin;
			const startUtc = new Date(localMidnightBaseUtc.getTime() - localMidnightOffset * 60000);
			const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60000 - 1);

		// Load or create today's check-in
		const existing = await getDailyCheckInByUserDateRangeForServiceRequest({
			headers: req.headers,
			userId,
			start: startUtc,
			end: endUtc,
		});
		let record = Array.isArray(existing) ? existing[0] : undefined;
		if (!record) {
			const created = await createDailyCheckInForServiceRequest({
				headers: req.headers,
				payload: { userId, date: startUtc },
			});
			record = Array.isArray(created) ? created[0] : created;
		}

		// Fetch user for notifications
		const userRows = await getUserByIdForServiceRequest({
			headers: req.headers,
			userId,
		});
		const userObj = Array.isArray(userRows) ? userRows[0] : userRows;
		const userName = (userObj as any)?.name ?? "there";

		// Log Reminder
		if ((s as any).dailyLogReminder) {
			const inWindow = withinWindow(nowMinLocal, logStartMin, logEndMin);
			const alreadyLogged = !!(record as any)?.hasLoggedTriggers;
			const alreadySent = !!(record as any)?.logReminderSent;

			console.log(`[PING] User ${userId} log reminder check:`);
			console.log(`  - Enabled: ${!!(s as any).dailyLogReminder}`);
			console.log(`  - In window: ${inWindow}`);
			console.log(`  - Already logged: ${alreadyLogged}`);
			console.log(`  - Already sent: ${alreadySent}`);

			if (inWindow && !alreadyLogged && !alreadySent) {
				console.log(`[PING] Sending log reminder to user ${userId}`);
				const windowLabel = formatLocalWindowLabel(logStartMin, logEndMin);
				const pushPayload: PushPayload = {
					title: "🍽️ Time to log your food!",
					body: `Hey ${userName}, don't forget to log your meals today (${windowLabel})`,
					data: {
						url: "/dashboard/food-log",
						action: "food_log_reminder",
						type: "daily_log_reminder",
						userId: userId,
					},
				};

				const success = await sendPushNotification(userId, pushPayload, req.headers);
				if (success) {
					await updateDailyCheckInForServiceRequest({
						headers: req.headers,
						id: (record as any).id,
						payload: { logReminderSent: true },
					});
					sentLog++;
					console.log(`[PING] ✅ Log reminder sent successfully to user ${userId}`);
				} else {
					console.log(`[PING] ❌ Failed to send log reminder to user ${userId}`);
				}
			} else {
				console.log(`[PING] Skipping log reminder for user ${userId} (conditions not met)`);
			}
		} else {
			console.log(`[PING] Log reminders disabled for user ${userId}`);
		}

		// Symptom Reminder
		if ((s as any).symptomCheckReminder) {
			const inWindow = withinWindow(nowMinLocal, symptomStartMin, symptomEndMin);
			const alreadyLogged = !!(record as any)?.hasLoggedSymptoms;
			const alreadySent = !!(record as any)?.symptomReminderSent;

			console.log(`[PING] User ${userId} symptom reminder check:`);
			console.log(`  - Enabled: ${!!(s as any).symptomCheckReminder}`);
			console.log(`  - In window: ${inWindow}`);
			console.log(`  - Already logged: ${alreadyLogged}`);
			console.log(`  - Already sent: ${alreadySent}`);

			if (inWindow && !alreadyLogged && !alreadySent) {
				console.log(`[PING] Sending symptom reminder to user ${userId}`);
				const windowLabel = formatLocalWindowLabel(symptomStartMin, symptomEndMin);
				const pushPayload: PushPayload = {
					title: "💭 Time for your daily reflection!",
					body: `Hey ${userName}, how are you feeling today? (${windowLabel})`,
					data: {
						url: "/dashboard/reflection",
						action: "symptom_check_reminder",
						type: "symptom_check_reminder",
						userId: userId,
					},
				};

				const success = await sendPushNotification(userId, pushPayload, req.headers);
				if (success) {
					await updateDailyCheckInForServiceRequest({
						headers: req.headers,
						id: (record as any).id,
						payload: { symptomReminderSent: true },
					});
					sentSymptom++;
					console.log(`[PING] ✅ Symptom reminder sent successfully to user ${userId}`);
				} else {
					console.log(`[PING] ❌ Failed to send symptom reminder to user ${userId}`);
				}
			} else {
				console.log(`[PING] Skipping symptom reminder for user ${userId} (conditions not met)`);
			}
		} else {
			console.log(`[PING] Symptom reminders disabled for user ${userId}`);
		}
	}

	console.log(`[PING] Processing complete. Sent ${sentLog} log reminders and ${sentSymptom} symptom reminders`);

	return NextResponse.json({
		success: true,
		processed: settings.length,
		sent: { 
			log: sentLog, 
			symptom: sentSymptom,
			total: sentLog + sentSymptom
		},
		timestamp: new Date().toISOString(),
		method: "fcm_push_notifications"
	});
	} catch (error) {
		console.error("[PING] Error processing ping request:", error);
		return NextResponse.json({
			success: false,
			error: "Internal server error",
			details: error instanceof Error ? error.message : "Unknown error"
		}, { status: 500 });
	}
}
