import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	async headers() {
		return [
			{
				source: "/api/:path*",
				headers: [
					{
						key: "Access-Control-Allow-Credentials",
						value: "true",
					},
					{
						key: "Access-Control-Allow-Origin",
						value: "http://localhost:8081/",
					},
					{
						key: "Access-Control-Allow-Methods",
						value: "GET, POST, PATCH, PUT, DELETE, OPTIONS",
					},
					{
						key: "Access-Control-Allow-Headers",
						value: "X-Requested-With, Content-Type, Authorization",
					},
				],
			},
		];
	},
};

export default nextConfig;
