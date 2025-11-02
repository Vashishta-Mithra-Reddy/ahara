// import { auth } from "@ahara/auth";
// import { headers } from "next/headers";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Dashboard from "./dashboard";
import { Suspense } from "react";
import Spinner from "@/components/blocks/Spinner";

export default async function DashboardPage() {
	// const session = await auth.api.getSession({
	// 	headers: await headers(),
	// });

	return (
		<Suspense fallback={<Spinner/>}>
		<ProtectedRoute requireOnboarding={true}>
			<Dashboard />
		</ProtectedRoute>
		</Suspense>
	);
}
