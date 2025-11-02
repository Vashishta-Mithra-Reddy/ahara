import { auth } from "@ahara/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Onboarding from "./Onboarding";

export default async function OnboardingPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	return <Onboarding />;
}
