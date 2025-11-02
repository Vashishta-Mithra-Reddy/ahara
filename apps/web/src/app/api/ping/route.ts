import { NextResponse } from "next/server";
import crypto from "crypto";
import {
	// Switched to auth-layer service wrappers
	getAllReminderSettingsForServiceRequest,
	getDailyCheckInByUserDateRangeForServiceRequest,
	createDailyCheckInForServiceRequest,
	updateDailyCheckInForServiceRequest,
	getUserByIdForServiceRequest,
} from "@ahara/auth";

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

async function sendEmail(to: string, subject: string, html: string) {
	const apiKey = process.env.RESEND_API_KEY;
	const from = process.env.MAIL_FROM || "Ahara <noreply@ahara.app>";
	if (!apiKey) {
		console.log("Email (simulated):", { to, subject, html });
		return true;
	}
	const resp = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from,
			to,
			subject,
			html,
		}),
	});
	return resp.ok;
}

// Fixed internal window durations
const LOG_WINDOW_MIN = 60;
const SYMPTOM_WINDOW_MIN = 60;

export async function GET(req: Request) {
	const authHeader = req.headers.get("authorization");
	const signature = req.headers.get("x-signature");
	const timestamp = req.headers.get("x-timestamp");

	const token = process.env.PING_BEARER_TOKEN!;
	const signingSecret = process.env.PING_SIGNING_SECRET!;

	if (authHeader !== `Bearer ${token}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const nowSec = Math.floor(Date.now() / 1000);
	if (!timestamp || Math.abs(nowSec - parseInt(timestamp)) > 60) {
		return NextResponse.json({ error: "Stale timestamp" }, { status: 400 });
	}

	const expected = crypto
		.createHmac("sha256", signingSecret)
		.update(timestamp)
		.digest("hex");
	if (signature !== expected) {
		return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
	}

	const settings = await getAllReminderSettingsForServiceRequest({
		headers: req.headers,
	});
	const nowUtc = new Date();

	let sentLog = 0;
	let sentSymptom = 0;

	for (const s of settings) {
		const userId = (s as any).userId as string;
		const tz = ((s as any).timezone as string) || "UTC";

		// Current local time (minutes since local midnight)
		const nowLocal = getLocalParts(nowUtc, tz);
		const nowMinLocal = nowLocal.hour * 60 + nowLocal.minute;

		// Local windows from settings
		const logStartMin = hhmmToMinutes(normalizeTime((s as any).logReminderTime ?? "20:00"));
		const logDuration = LOG_WINDOW_MIN;
		const logEndMin = (logStartMin + logDuration) % (24 * 60);

		const symptomStartMin = hhmmToMinutes(normalizeTime((s as any).symptomCheckTime ?? "22:00"));
		const symptomDuration = SYMPTOM_WINDOW_MIN;
		const symptomEndMin = (symptomStartMin + symptomDuration) % (24 * 60);

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

		// Fetch user for email
		const userRows = await getUserByIdForServiceRequest({
			headers: req.headers,
			userId,
		});
		const userObj = Array.isArray(userRows) ? userRows[0] : userRows;
		const toEmail = (userObj as any)?.email;
		const userName = (userObj as any)?.name ?? "there";

		// Log Reminder
		if ((s as any).dailyLogReminder) {
			const inWindow = withinWindow(nowMinLocal, logStartMin, logEndMin);
			const alreadyLogged = !!(record as any)?.hasLoggedTriggers;
			const alreadySent = !!(record as any)?.logReminderSent;

			if (inWindow && !alreadyLogged && !alreadySent && toEmail) {
				const windowLabel = formatLocalWindowLabel(logStartMin, logEndMin);
				const ok = await sendEmail(
					toEmail,
					"Reminder: log your food",
					`<p>Hey ${userName},</p><p>We'll remind you between <strong>${windowLabel}</strong> to log your food today.</p><p>Open Ahara to record your entries.</p>`,
				);
				if (ok) {
					await updateDailyCheckInForServiceRequest({
						headers: req.headers,
						id: (record as any).id,
						payload: { logReminderSent: true },
					});
					sentLog++;
				}
			}
		}

		// Symptom Reminder
		if ((s as any).symptomCheckReminder) {
			const inWindow = withinWindow(nowMinLocal, symptomStartMin, symptomEndMin);
			const alreadyLogged = !!(record as any)?.hasLoggedSymptoms;
			const alreadySent = !!(record as any)?.symptomReminderSent;

			if (inWindow && !alreadyLogged && !alreadySent && toEmail) {
				const windowLabel = formatLocalWindowLabel(symptomStartMin, symptomEndMin);
				const ok = await sendEmail(
					toEmail,
					"Reminder: check your symptoms",
					`<p>Hey ${userName},</p><p>We'll remind you between <strong>${windowLabel}</strong> to check symptoms today.</p><p>Open Ahara to record your state.</p>`,
				);
				if (ok) {
					await updateDailyCheckInForServiceRequest({
						headers: req.headers,
						id: (record as any).id,
						payload: { symptomReminderSent: true },
					});
					sentSymptom++;
				}
			}
		}
	}

	return NextResponse.json({
		success: true,
		processed: settings.length,
		sent: { log: sentLog, symptom: sentSymptom },
	});
}
