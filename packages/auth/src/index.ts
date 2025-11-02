import { expo } from '@better-auth/expo';
import { nextCookies } from 'better-auth/next-js';
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@ahara/db";
import * as schema from "@ahara/db/schema/auth";
// import type { BetterAuthOptions } from "better-auth";


function isValidHttpOrigin(origin?: string) {
	// Accept only http(s) origins; exclude empty strings and custom schemes
	if (!origin) return false;
	try {
		const url = new URL(origin);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

const rawOrigins = [
	process.env.CORS_ORIGIN,
	process.env.EXPO_PUBLIC_SERVER_URL,
	"http://192.168.29.43:3001",
	"https://192.168.29.43:3001",
	"http://localhost:3001",
	"https://localhost:3001",
	"http://localhost:8081",
	"mybettertapp://",
	"ahara://",
	"exp://",
];

const safeTrustedOrigins = rawOrigins
	.filter(isValidHttpOrigin)
	.map((o) => o!.replace(/\/+$/, ""));

export const auth: ReturnType<typeof betterAuth> = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	trustedOrigins: [...safeTrustedOrigins,"exp://","mybettertapp://","ahara://"],
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
        google: { 
            clientId: [process.env.GOOGLE_WEB_CLIENT_ID as string, process.env.GOOGLE_NATIVE_CLIENT_ID as string], 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
	plugins: [nextCookies(), expo()]
});

export * from "./queries/food-diary";
export * from "./queries/push";
