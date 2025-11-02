import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserOnboardingStatusForRequest } from "@ahara/auth";

export default async function OnboardingGuard() {
	try {
		const requestHeaders = await headers();
		const onboardingStatus = await getUserOnboardingStatusForRequest({
			headers: requestHeaders,
		});

		// onboardingStatus is an array, check if any status is completed
		const isCompleted =
			onboardingStatus &&
			onboardingStatus.length > 0 &&
			onboardingStatus[0]?.completed;

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
