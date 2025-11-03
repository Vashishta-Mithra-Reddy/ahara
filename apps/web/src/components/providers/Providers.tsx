"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "../ui/sonner";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import PushNotificationsInit from "./PushNotificationsInit";
import { PostHogProvider } from "./Posthog";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<PostHogProvider>{children}</PostHogProvider>
			<Toaster position="top-center" />
			<ServiceWorkerRegister />
			<PushNotificationsInit />
		</ThemeProvider>
	);
}
