import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
	getTriggerEntriesByDateForRequest,
	createTriggerEntryForRequest,
} from "@ahara/auth";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const date = searchParams.get("date");

		const requestHeaders = await headers();
		const entries = await getTriggerEntriesByDateForRequest({
			headers: requestHeaders,
			date: date ? new Date(date) : undefined,
		});

		return NextResponse.json(entries);
	} catch (error) {
		console.error("Error fetching trigger entries:", error);
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "Failed to fetch trigger entries" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			name,
			description,
			category,
			subcategory,
			intensity,
			duration,
			loggedAt,
		} = body;

		// Validation
		if (!name || typeof name !== "string" || name.trim().length === 0) {
			return NextResponse.json(
				{ error: "Name is required and must be a non-empty string" },
				{ status: 400 },
			);
		}

		if (
			!category ||
			typeof category !== "string" ||
			category.trim().length === 0
		) {
			return NextResponse.json(
				{ error: "Category is required and must be a non-empty string" },
				{ status: 400 },
			);
		}

		if (description && typeof description !== "string") {
			return NextResponse.json(
				{ error: "Description must be a string" },
				{ status: 400 },
			);
		}

		if (subcategory && typeof subcategory !== "string") {
			return NextResponse.json(
				{ error: "Subcategory must be a string" },
				{ status: 400 },
			);
		}

		if (
			intensity !== undefined &&
			(typeof intensity !== "number" || intensity < 1 || intensity > 10)
		) {
			return NextResponse.json(
				{ error: "Intensity must be a number between 1 and 10" },
				{ status: 400 },
			);
		}

		if (
			duration !== undefined &&
			(typeof duration !== "number" || duration < 0)
		) {
			return NextResponse.json(
				{ error: "Duration must be a non-negative number" },
				{ status: 400 },
			);
		}

		if (loggedAt && typeof loggedAt !== "string") {
			return NextResponse.json(
				{ error: "LoggedAt must be a string (ISO date)" },
				{ status: 400 },
			);
		}

		const requestHeaders = await headers();
		const entry = await createTriggerEntryForRequest({
			headers: requestHeaders,
			payload: {
				name: name.trim(),
				description: description?.trim(),
				category: category.trim(),
				subcategory: subcategory?.trim(),
				intensity,
				duration,
				loggedAt,
			},
		});

		return NextResponse.json(entry, { status: 201 });
	} catch (error) {
		console.error("Error creating trigger entry:", error);
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "Failed to create trigger entry" },
			{ status: 500 },
		);
	}
}
