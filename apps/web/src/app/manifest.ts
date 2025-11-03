import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "ahara",
		short_name: "ahara",
		description: "Trigger Analyzer",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#0ea5e9",
		icons: [
			{ src: "/icons/ahara-192.png", sizes: "192x192", type: "image/png" },
			{ src: "/icons/ahara-512.png", sizes: "512x512", type: "image/png" },
		],
		// screenshots: [
		//   {
		//     src: "/screenshots/ahara-1.png",
		//     sizes: "1280x720",
		//     type: "image/png",
		//   },
		// ],
	};
}
