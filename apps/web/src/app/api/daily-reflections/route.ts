import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
	getDailyCheckInByDateForRequest,
	createDailyCheckInForRequest,
	updateDailyCheckInForRequest,
} from "@ahara/auth";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const date =
			searchParams.get("date") || new Date().toISOString().split("T")[0];

		const reflection = await getDailyCheckInByDateForRequest({
			headers: await headers(),
			date,
		});

		return NextResponse.json(reflection);
	} catch (error) {
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		console.error("Error fetching daily reflection:", error);
		return NextResponse.json(
			{ error: "Failed to fetch daily reflection" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { date, overallFeeling, energy, mood, sleep, digestion, notes } =
			body;

		if (overallFeeling === undefined) {
			return NextResponse.json(
				{ error: "overallFeeling is required" },
				{ status: 400 },
			);
		}
		if (overallFeeling < 1 || overallFeeling > 10) {
			return NextResponse.json(
				{ error: "overallFeeling must be between 1 and 10" },
				{ status: 400 },
			);
		}

		const result = await createDailyCheckInForRequest({
			headers: await headers(),
			payload: { date },
		});

		return NextResponse.json(result);
	} catch (error) {
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		console.error("Error creating daily reflection:", error);
		return NextResponse.json(
			{ error: "Failed to create daily reflection" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, overallFeeling, energy, mood, sleep, digestion, notes } = body;

		if (!id) {
			return NextResponse.json(
				{ error: "id is required for updating reflection" },
				{ status: 400 },
			);
		}

		const result = await updateDailyCheckInForRequest({
			headers: await headers(),
			id,
			payload: {},
		});

		return NextResponse.json(result);
	} catch (error) {
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		console.error("Error updating daily reflection:", error);
		return NextResponse.json(
			{ error: "Failed to update daily reflection" },
			{ status: 500 },
		);
	}
}
