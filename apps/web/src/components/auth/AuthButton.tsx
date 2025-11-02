"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function AuthButton({ className }: { className?: string }) {
	const { data: session, isPending } = authClient.useSession();
	const [onboardingCompleted, setOnboardingCompleted] = useState<
		boolean | null
	>(null);

	useEffect(() => {
		if (!session) {
			setOnboardingCompleted(null);
			return;
		}
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch("/api/onboarding");
				if (res.ok) {
					const status = await res.json();
					const isCompleted = Array.isArray(status)
						? status[0]?.completed === true
						: !!status?.completed;
					if (!cancelled) setOnboardingCompleted(isCompleted);
				} else {
					if (!cancelled) setOnboardingCompleted(true);
				}
			} catch {
				if (!cancelled) setOnboardingCompleted(true);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [session]);

	if (isPending) {
		return (
			<div className="flex animate-pulse items-center gap-2 rounded-xl bg-foreground/5 px-4 py-3">
				<div className="size-4 rounded-full bg-foreground/20" />
				<div className="h-4 w-16 rounded bg-foreground/20" />
			</div>
		);
	}

	if (!session) {
		return (
			<Link
				href="/login"
				className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 border-white/40 px-6 py-3 text-center text-white transition-all duration-300 hover:bg-white/20 hover:text-white/90 font-jakarta ${className || ""}`}
			>
				<span className="font-medium text-base">Sign In</span>
			</Link>
		);
	}

	return (
		<Link
			href={onboardingCompleted === false ? "/onboarding" : "/dashboard"}
			className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 border-white/40 px-6 py-3 text-center text-white transition-all duration-500 hover:bg-white/20 hover:text-white/90 font-jakarta ${className || ""}`}
		>
			<span className="font-medium text-base">
				{onboardingCompleted === false
					? "Complete Onboarding"
					: "Go to Dashboard"}
			</span>
		</Link>
	);
}
