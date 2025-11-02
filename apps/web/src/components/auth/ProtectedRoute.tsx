import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@ahara/auth";

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
		const isCompleted = session.user.onboardingCompleted || false;

		if (!isCompleted) {
			redirect("/onboarding");
		}
	}

	return <>{children}</>;
}
