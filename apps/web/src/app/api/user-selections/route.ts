import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
	getUserTrackingSelectionsForRequest,
	createUserTrackingSelectionForRequest,
	updateUserTrackingSelectionForRequest,
} from "@ahara/auth";

// GET /api/user-selections - Get user's tracking selections
export async function GET(request: NextRequest) {
	try {
		const requestHeaders = await headers();
		const selections = await getUserTrackingSelectionsForRequest({
			headers: requestHeaders,
		});

		return NextResponse.json(selections);
	} catch (error) {
		console.error("Error fetching user tracking selections:", error);
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "Failed to fetch user tracking selections" },
			{ status: 500 },
		);
	}
}

// POST /api/user-selections - Create a new user tracking selection
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { trackingItemId, active, customName, customAdded } = body;

		// Validation
		if (
			!trackingItemId ||
			typeof trackingItemId !== "string" ||
			trackingItemId.trim().length === 0
		) {
			return NextResponse.json(
				{ error: "trackingItemId is required and must be a non-empty string" },
				{ status: 400 },
			);
		}

		if (active !== undefined && typeof active !== "boolean") {
			return NextResponse.json(
				{ error: "active must be a boolean" },
				{ status: 400 },
			);
		}

		if (customName && typeof customName !== "string") {
			return NextResponse.json(
				{ error: "customName must be a string" },
				{ status: 400 },
			);
		}

		if (customAdded !== undefined && typeof customAdded !== "boolean") {
			return NextResponse.json(
				{ error: "customAdded must be a boolean" },
				{ status: 400 },
			);
		}

		const requestHeaders = await headers();
		const selection = await createUserTrackingSelectionForRequest({
			headers: requestHeaders,
			payload: {
				trackingItemId: trackingItemId.trim(),
				active: active ?? true,
				customName: customName?.trim(),
				customAdded: customAdded ?? false,
			},
		});

		return NextResponse.json(selection, { status: 201 });
	} catch (error) {
		console.error("Error creating user tracking selection:", error);
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "Failed to create user tracking selection" },
			{ status: 500 },
		);
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, active, customName } = body;

		if (!id || typeof id !== "string" || id.trim().length === 0) {
			return NextResponse.json(
				{ error: "id is required and must be a non-empty string" },
				{ status: 400 },
			);
		}

		if (active !== undefined && typeof active !== "boolean") {
			return NextResponse.json(
				{ error: "active must be a boolean" },
				{ status: 400 },
			);
		}

		if (customName !== undefined && typeof customName !== "string") {
			return NextResponse.json(
				{ error: "customName must be a string" },
				{ status: 400 },
			);
		}

		const requestHeaders = await headers();
		const updated = await updateUserTrackingSelectionForRequest({
			headers: requestHeaders,
			id,
			payload: {
				active,
				customName: customName?.trim(),
			},
		});

		return NextResponse.json(updated);
	} catch (error) {
		console.error("Error updating user tracking selection:", error);
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "Failed to update user tracking selection" },
			{ status: 500 },
		);
	}
}
