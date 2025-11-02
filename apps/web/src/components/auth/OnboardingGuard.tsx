import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@ahara/auth";

export default async function OnboardingGuard() {
	try {
		const requestHeaders = await headers();
		const session = await auth.api.getSession({ headers: requestHeaders });

		// If no session, redirect to login
		if (!session?.user) {
			redirect("/login");
		}

		// Check onboarding status from session data
		const isCompleted = session.user.onboardingCompleted || false;

		// If onboarding is not completed, redirect to onboarding
		if (!isCompleted) {
			redirect("/onboarding");
		}

		// If onboarding is completed, return null (allow access)
		return null;
	} catch (error) {
		console.error("Error checking onboarding status:", error);
		// On error, redirect to onboarding to be safe
		redirect("/onboarding");
	}
}
