import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ProtectedRoute requireOnboarding={true}>
			<div className="space-y-6 wrapperx font-jakarta w-full">{children}</div>
		</ProtectedRoute>
	);
}
