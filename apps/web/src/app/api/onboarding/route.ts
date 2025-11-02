import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@ahara/auth";
import {
	getReminderSettingsByUserForRequest,
	createReminderSettingsForRequest,
} from "@ahara/auth";

// GET /api/onboarding - Get user's onboarding status
export async function GET(request: NextRequest) {
	try {
		const requestHeaders = await headers();
		const session = await auth.api.getSession({
			headers: requestHeaders,
		});
	

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = session?.user;

		// Return onboarding status from session data
		const status = {
			completed: user.onboardingCompleted || false,
			completedAt: user.onboardingCompletedAt || null,
		};

		return NextResponse.json(status);
	} catch (error) {
		console.error("Error fetching onboarding status:", error);
		return NextResponse.json(
			{ error: "Failed to fetch onboarding status" },
			{ status: 500 },
		);
	}
}

// POST /api/onboarding - Create/Update onboarding status
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { completed, completedAt, timezone } = body;

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
		
		// Use Better Auth's updateUser function
		const updateData: any = {};
		if (completed !== undefined) {
			updateData.onboardingCompleted = completed;
		}
		if (completedAt) {
			updateData.onboardingCompletedAt = new Date(completedAt);
		} else if (completed === true && !completedAt) {
			// Auto-set completion time if not provided
			updateData.onboardingCompletedAt = new Date();
		}

		const result = await auth.api.updateUser({
			body: updateData,
			headers: requestHeaders,
		});

		if (!result) {
			return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
		}

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
						timezone: timezone ?? "UTC",
						dailyLogReminder: true,
						logReminderTime: "20:00",
						symptomCheckReminder: true,
						symptomCheckTime: "07:00",
					},
				});
			}
		}

		// Get the updated session to return current status
		const updatedSession = await auth.api.getSession({
			headers: requestHeaders,
		});

		// Return the updated status
		const status = {
			completed: updatedSession?.user?.onboardingCompleted || false,
			completedAt: updatedSession?.user?.onboardingCompletedAt || null,
		};

		return NextResponse.json(status, { status: 201 });
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

// PUT /api/onboarding - Update onboarding status
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { completed, completedAt, timezone } = body;

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
		
		// Use Better Auth's updateUser function
		const updateData: any = {};
		if (completed !== undefined) {
			updateData.onboardingCompleted = completed;
		}
		if (completedAt) {
			updateData.onboardingCompletedAt = new Date(completedAt);
		} else if (completed === true && completedAt === undefined) {
			// Auto-set completion time if not provided but completed is true
			updateData.onboardingCompletedAt = new Date();
		}

		const result = await auth.api.updateUser({
			body: updateData,
			headers: requestHeaders,
		});

		if (!result) {
			return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
		}

		// Auto-populate defaults on update when completed flips to true
		if (completed === true) {
			const existing = await getReminderSettingsByUserForRequest({
				headers: requestHeaders,
			});
			const hasSettings = Array.isArray(existing) ? !!existing[0] : !!existing;
			if (!hasSettings) {
				await createReminderSettingsForRequest({
					headers: requestHeaders,
					payload: {
						timezone: timezone ?? "UTC",
						dailyLogReminder: true,
						logReminderTime: "20:00",
						symptomCheckReminder: true,
						symptomCheckTime: "07:00",
					},
				});
			}
		}

		// Get the updated session to return current status
		const updatedSession = await auth.api.getSession({
			headers: requestHeaders,
		});

		// Return the updated status
		const status = {
			completed: updatedSession?.user?.onboardingCompleted || false,
			completedAt: updatedSession?.user?.onboardingCompletedAt || null,
		};

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
