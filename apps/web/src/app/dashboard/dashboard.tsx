"use client";
import { Button } from "@/components/ui/button";
import type { authClient } from "@/lib/auth-client";

export default function Dashboard({
	session,
}: {
	session: typeof authClient.$Infer.Session;
}) {
	return <></>;
}
