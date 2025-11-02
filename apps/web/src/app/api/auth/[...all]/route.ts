import { auth } from "@ahara/auth";
import { toNextJsHandler } from "better-auth/next-js";

// import { NextResponse } from "next/server";

export const { GET, POST } = toNextJsHandler(auth.handler);

// export async function OPTIONS() {
//   return NextResponse.json(null, {
//     status: 200,
//     headers: {
//       "Access-Control-Allow-Origin": "http://localhost:8081",
//       "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//       "Access-Control-Allow-Credentials": "true",
//     },
//   });
// }

