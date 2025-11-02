import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@ahara/auth";
import { getUserOnboardingStatusForRequest } from "@ahara/auth";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requireOnboarding?: boolean;
}

export default async function ProtectedRoute({
	children,
	requireOnboarding = true,
}: ProtectedRouteProps) {
	const requestHeaders = await headers();

	// Require authentication
	const session = await auth.api.getSession({ headers: requestHeaders });
	if (!session?.user) {
		redirect("/login");
	}

	// Require onboarding if requested
	if (requireOnboarding) {
		const onboardingStatus = await getUserOnboardingStatusForRequest({
			headers: requestHeaders,
		});

		const isCompleted =
			Array.isArray(onboardingStatus) &&
			onboardingStatus.length > 0 &&
			onboardingStatus[0]?.completed === true;

		if (!isCompleted) {
			redirect("/onboarding");
		}
	}

	return <>{children}</>;
}
