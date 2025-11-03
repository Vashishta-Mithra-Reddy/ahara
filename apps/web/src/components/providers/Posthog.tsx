// app/providers.tsx
"use client";

// import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);

		// Only initialize PostHog on the client side
		if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
			posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
				api_host:
					process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
				person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
				defaults: "2025-05-24",
			});
		}
	}, []);

	// Don't render PostHog provider during SSR
	if (!isClient) {
		return <>{children}</>;
	}

	return <PHProvider client={posthog}>{children}</PHProvider>;
}
