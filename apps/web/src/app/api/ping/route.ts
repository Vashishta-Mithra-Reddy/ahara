import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");

  if (!auth || auth !== `Bearer ${process.env.AHARA_BEARER_TOKEN}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  console.log("Ping received at", new Date().toISOString());
  return NextResponse.json({ message: "Ping successful" });
}
