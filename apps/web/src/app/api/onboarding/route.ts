import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
	getUserOnboardingStatusForRequest,
	createUserOnboardingStatusForRequest,
	updateUserOnboardingStatusForRequest,
	getReminderSettingsByUserForRequest,
	createReminderSettingsForRequest,
} from "@ahara/auth";

// GET /api/onboarding - Get user's onboarding status
export async function GET(request: NextRequest) {
	try {
		const requestHeaders = await headers();
		const status = await getUserOnboardingStatusForRequest({
			headers: requestHeaders,
		});

		return NextResponse.json(status);
	} catch (error) {
		console.error("Error fetching onboarding status:", error);
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "Failed to fetch onboarding status" },
			{ status: 500 },
		);
	}
}

// POST /api/onboarding - Create onboarding status
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { completed, completedAt } = body;

		// Validation
		if (completed !== undefined && typeof completed !== "boolean") {
			return NextResponse.json(
				{ error: "completed must be a boolean" },
				{ status: 400 },
			);
		}

		if (completedAt && typeof completedAt !== "string") {
			return NextResponse.json(
				{ error: "completedAt must be a string (ISO date)" },
				{ status: 400 },
			);
		}

		const requestHeaders = await headers();
		const status = await createUserOnboardingStatusForRequest({
			headers: requestHeaders,
			payload: {
				completed: completed ?? false,
				completedAt: completedAt ? new Date(completedAt) : undefined,
			},
		});

		// Auto-populate default reminder settings if onboarding completed and none exist
		if (completed === true) {
			const existing = await getReminderSettingsByUserForRequest({
				headers: requestHeaders,
			});
			const hasSettings = Array.isArray(existing) ? !!existing[0] : !!existing;
			if (!hasSettings) {
				await createReminderSettingsForRequest({
					headers: requestHeaders,
					payload: {
						// Prefer client-provided timezone; fallback to UTC
						timezone: (request as any)?.body?.timezone ?? "UTC",
						dailyLogReminder: true,
						logReminderTime: "20:00",
						symptomCheckReminder: true,
						symptomCheckTime: "07:00",
					},
				});
			}
		}

		return NextResponse.json(status, { status: 201 });
	} catch (error) {
		console.error("Error creating onboarding status:", error);
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "Failed to create onboarding status" },
			{ status: 500 },
		);
	}
}

// PUT /api/onboarding - Update onboarding status
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { completed, completedAt } = body;

		// Validation
		if (completed !== undefined && typeof completed !== "boolean") {
			return NextResponse.json(
				{ error: "completed must be a boolean" },
				{ status: 400 },
			);
		}

		if (completedAt !== undefined && typeof completedAt !== "string") {
			return NextResponse.json(
				{ error: "completedAt must be a string (ISO date)" },
				{ status: 400 },
			);
		}

		const requestHeaders = await headers();
		const status = await updateUserOnboardingStatusForRequest({
			headers: requestHeaders,
			payload: {
				completed,
				completedAt: completedAt ? new Date(completedAt) : undefined,
			},
		});

		// Auto-populate defaults on update when completed flips to true
		if (completed === true) {
			const existing = await getReminderSettingsByUserForRequest({
				headers: requestHeaders,
			});
			const hasSettings = Array.isArray(existing) ? !!existing[0] : !!existing;
			if (!hasSettings) {
				// Parse timezone from request body if provided
				const body = await request.json().catch(() => ({}));
				await createReminderSettingsForRequest({
					headers: requestHeaders,
					payload: {
						timezone: body?.timezone ?? "UTC",
						dailyLogReminder: true,
						logReminderTime: "20:00",
						symptomCheckReminder: true,
						symptomCheckTime: "07:00",
					},
				});
			}
		}

		return NextResponse.json(status);
	} catch (error) {
		console.error("Error updating onboarding status:", error);
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "Failed to update onboarding status" },
			{ status: 500 },
		);
	}
}
