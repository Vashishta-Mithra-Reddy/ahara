import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { registerPushTokenForRequest } from "@ahara/auth";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { token, platform, deviceName } = body;

		if (!token || typeof token !== "string") {
			return NextResponse.json({ error: "token is required" }, { status: 400 });
		}

		const requestHeaders = await headers();
		const result = await registerPushTokenForRequest({
			headers: requestHeaders,
			token,
			platform,
			deviceName,
		});
		const row = Array.isArray(result) ? result[0] : result;
		return NextResponse.json(row, { status: 201 });
	} catch (error) {
		console.error("Error registering push token:", error);
		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "Failed to register token" },
			{ status: 500 },
		);
	}
}
