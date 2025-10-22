import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export default function AuthButton({ className }: { className?: string }) {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="flex animate-pulse items-center gap-2 rounded-xl bg-foreground/5 px-4 py-3">
				<div className="size-4 rounded-full bg-foreground/20" />
				<div className="h-4 w-16 rounded bg-foreground/20" />
			</div>
		);
	}

	if (!session) {
		return (
			<Link
				href="/login"
				className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 border-white/40 px-6 py-3 text-center text-white transition-all duration-300 hover:bg-white/20 hover:text-white/90 ${className || ""}`}
			>
				{/* <User className="size-4" /> */}
				<span className="font-medium text-base">Sign In</span>
			</Link>
		);
	}

	return (
		<Link
			href="/dashboard"
			className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 border-foreground/20 px-6 py-3 text-center transition-all duration-300 hover:bg-foreground/5 hover:text-foreground/90 ${className || ""}`}
		>
			{/* <User className="size-4" /> */}
			<span className="font-medium text-base">Go to Dashboard</span>
		</Link>
	);
}
