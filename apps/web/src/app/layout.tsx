import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "../index.css";
import { Analytics } from "@vercel/analytics/next";
import Footer from "@/components/blocks/Footer";
import Header from "@/components/blocks/Header";
import Providers from "@/components/providers/Providers";

// const geistSans = Geist({
// 	variable: "--font-geist-sans",
// 	subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
// 	variable: "--font-geist-mono",
// 	subsets: ["latin"],
// });

const outfit = Outfit({
	variable: "--font-outfit",
	subsets: ["latin"],
});

// const splineSans = Spline_Sans({
// 	variable: "--font-spline-sans",
// 	subsets: ["latin"],
// });

const plusJakartaSans = Plus_Jakarta_Sans({
	variable: "--font-plus-jakarta-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "ahara",
	description: "ahara",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${outfit.variable} ${plusJakartaSans.variable} antialiased`}
			>
				<Providers>
					<div className="grid h-svh grid-rows-[auto_1fr]">
						<Header />
						{children}
						<Footer />
						<Analytics />
					</div>
				</Providers>
			</body>
		</html>
	);
}
