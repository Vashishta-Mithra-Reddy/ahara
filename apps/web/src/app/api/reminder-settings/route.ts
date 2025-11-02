import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
	getReminderSettingsByUserForRequest,
	createReminderSettingsForRequest,
	updateReminderSettingsForRequest,
} from "@ahara/auth";

export async function GET(request: NextRequest) {
	try {
		const requestHeaders = await headers();
		// console.log("[reminder-settings] Request headers:", requestHeaders);
		const settings = await getReminderSettingsByUserForRequest({
			headers: requestHeaders,
		});
		const result = Array.isArray(settings) ? (settings[0] ?? null) : settings;
		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching reminder settings:", error);
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "Failed to fetch reminder settings" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const requestHeaders = await headers();

		const existingRows = await getReminderSettingsByUserForRequest({
			headers: requestHeaders,
		});
		const existing = Array.isArray(existingRows) ? existingRows[0] : existingRows;

		const payload = {
			timezone: body.timezone,
			dailyLogReminder: body.dailyLogReminder,
			logReminderTime: body.logReminderTime,
			symptomCheckReminder: body.symptomCheckReminder,
			symptomCheckTime: body.symptomCheckTime,
		};

		if (existing) {
			const updated = await updateReminderSettingsForRequest({
				headers: requestHeaders,
				payload,
			});
			const result = Array.isArray(updated) ? (updated[0] ?? updated) : updated;
			return NextResponse.json(result);
		}

		const created = await createReminderSettingsForRequest({
			headers: requestHeaders,
			payload,
		});
		const result = Array.isArray(created) ? (created[0] ?? created) : created;
		return NextResponse.json(result, { status: 201 });
	} catch (error) {
		console.error("Error creating/updating reminder settings:", error);
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "Failed to save reminder settings" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const requestHeaders = await headers();

		const payload = {
			timezone: body.timezone,
			dailyLogReminder: body.dailyLogReminder,
			logReminderTime: body.logReminderTime,
			symptomCheckReminder: body.symptomCheckReminder,
			symptomCheckTime: body.symptomCheckTime,
		};

		const updated = await updateReminderSettingsForRequest({
			headers: requestHeaders,
			payload,
		});
		let result = Array.isArray(updated) ? updated[0] : updated;

		if (!result) {
			const created = await createReminderSettingsForRequest({
				headers: requestHeaders,
				payload,
			});
			result = Array.isArray(created) ? created[0] : created;
			return NextResponse.json(result, { status: 201 });
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error updating reminder settings:", error);
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "Failed to update reminder settings" },
			{ status: 500 },
		);
	}
}
