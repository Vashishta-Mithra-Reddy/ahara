"use client";

import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center px-4">
			<div className="text-center">
				<h1 className="text-6xl font-bold text-gray-500 mb-4">404</h1>
				<h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
				<p className="text-gray-600 mb-8 max-w-md">
					Sorry, the page you're looking for doesn't exist or has been moved.
				</p>
				<Link
					href="/"
					className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
				>
					Go Home
				</Link>
			</div>
		</div>
	);
}
