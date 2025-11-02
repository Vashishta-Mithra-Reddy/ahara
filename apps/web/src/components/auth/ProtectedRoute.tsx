"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Spinner from "../blocks/Spinner";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requireOnboarding?: boolean;
}

export default function ProtectedRoute({
	children,
	requireOnboarding = true,
}: ProtectedRouteProps) {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (isPending) return;

		if (!session?.user) {
			router.push("/login");
			return;
		}

		if (requireOnboarding) {
			// Check onboarding status
			fetch("/api/onboarding")
				.then(async (res) => {
					if (!res.ok) return;
					const onboardingStatus = await res.json();
					const isCompleted =
						Array.isArray(onboardingStatus) &&
						onboardingStatus.length > 0 &&
						onboardingStatus[0]?.completed === true;

					if (!isCompleted) {
						router.push("/onboarding");
					}
				})
				.catch(() => {
					// If onboarding check fails, assume completed to avoid redirect loops
				});
		}
	}, [session, isPending, requireOnboarding, router]);

	if (isPending) {
		return <Spinner />;
	}

	if (!session?.user) {
		return <Spinner />;
	}

	return <>{children}</>;
}
