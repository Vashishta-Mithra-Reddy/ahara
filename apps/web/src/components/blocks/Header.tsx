"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "../auth/user-menu";
import { authClient } from "@/lib/auth-client";

export default function Header() {
	// const links = [
	// 	{ to: "/", label: "Home" },
	// 	{ to: "/dashboard", label: "Dashboard" },
	// ] as const;
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const activeTab = searchParams.get("tab");
	const { data: session } = authClient.useSession();

	const isLoggedIn = !!session;
	const isDashboard = pathname === "/dashboard";

	const dashboardTabs = [
		{ key: "overview", label: "Overview", path: { pathname: "/dashboard" } },
		{
			key: "food-log",
			label: "Food Log",
			path: { pathname: "/dashboard", query: { tab: "food-log" } },
		},
		{
			key: "reflection",
			label: "Daily Reflection",
			path: { pathname: "/dashboard", query: { tab: "reflection" } },
		},
		{
			key: "insights",
			label: "Insights",
			path: { pathname: "/dashboard", query: { tab: "insights" } },
		},
		{
			key: "settings",
			label: "Settings",
			path: { pathname: "/dashboard", query: { tab: "settings" } },
		},
	];

	return (
		<div>
			<div className="flex flex-row items-center justify-between border-b-2 border-dashed px-6 md:px-12 py-4 font-outfit text-gray-600 dark:text-foreground">
				<Link
					href={"/"}
					className="font-medium font-outfit text-3xl text-glow text-gray-500 dark:text-foreground pr-12"
				>
					āhāra
				</Link>
				{/* <nav className="flex gap-4 text-medium">
					{links.map(({ to, label }) => {
						return (
							<Link key={to} href={to}>
								{label}
							</Link>
						);
					})}
				</nav> */}
				{/* Dashboard Navigation Tabs */}
				{isLoggedIn && isDashboard && (
					<div className="md:flex hidden items-center space-x-4 font-jakarta">
						<div className="flex space-x-4 border-gray-200 overflow-x-auto no-scrollbar">
							{dashboardTabs.map((item) => (
								<Link
									key={item.key}
									href={item.path}
									className={`relative px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 
										${
											(item.key === "overview" && !activeTab) ||
											(activeTab === item.key)
												? "text-primary bg-gray-200 dark:bg-gray-800"
												: "text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700"
										}`}
								>
									{item.label}
								</Link>
							))}
						</div>
					</div>
				)}

				<div className="flex items-center gap-2">
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
			{/* <hr /> */}
		</div>
	);
}
