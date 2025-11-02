import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
	getDefaultTrackingItemsForRequest,
	getAllTrackingItemsForRequest,
	createTrackingItemForRequest,
} from "@ahara/auth";

// GET /api/tracking-items - Get tracking items (default or all)
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const defaultOnly = searchParams.get("default") === "true";

		const requestHeaders = await headers();

		let trackingItems;
		if (defaultOnly) {
			trackingItems = await getDefaultTrackingItemsForRequest({
				headers: requestHeaders,
			});
		} else {
			trackingItems = await getAllTrackingItemsForRequest({
				headers: requestHeaders,
			});
		}

		return NextResponse.json(trackingItems);
	} catch (error) {
		console.error("Error fetching tracking items:", error);
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "Failed to fetch tracking items" },
			{ status: 500 },
		);
	}
}

// POST /api/tracking-items - Create a new tracking item
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, category, description, isDefault } = body;

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

		if (isDefault !== undefined && typeof isDefault !== "boolean") {
			return NextResponse.json(
				{ error: "isDefault must be a boolean" },
				{ status: 400 },
			);
		}

		const requestHeaders = await headers();
		const trackingItem = await createTrackingItemForRequest({
			headers: requestHeaders,
			payload: {
				name: name.trim(),
				category: category.trim(),
				description: description?.trim(),
				isDefault: isDefault ?? false,
			},
		});

		return NextResponse.json(trackingItem, { status: 201 });
	} catch (error) {
		console.error("Error creating tracking item:", error);
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "Failed to create tracking item" },
			{ status: 500 },
		);
	}
}
