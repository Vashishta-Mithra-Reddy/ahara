import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const signature = req.headers.get("x-signature");
  const timestamp = req.headers.get("x-timestamp");

  const token = process.env.PING_BEARER_TOKEN!;
  const signingSecret = process.env.PING_SIGNING_SECRET!;

  if (authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);
  if (!timestamp || Math.abs(now - parseInt(timestamp)) > 60) {
    return NextResponse.json({ error: "Stale timestamp" }, { status: 400 });
  }

  const expected = crypto
    .createHmac("sha256", signingSecret)
    .update(timestamp)
    .digest("hex");

  if (signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  console.log("Verified secure ping");
  return NextResponse.json({ success: true });
}
