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

export default function UserMenu({ className }: { className?: string }) {
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
				className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 border-foreground/20 px-6 py-3 text-center transition-all duration-500 hover:bg-foreground/5 hover:text-foreground/90 hover:scale-105 active:scale-100 ${className || ""}`}
			>
				{/* <User className="size-4" /> */}
				<span className="font-medium text-base">Sign In</span>
			</Link>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<div className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-3 text-center transition-all duration-300 hover:bg-foreground/5 hover:text-foreground/90">
					<User className="size-4" />
					<span className="max-w-24 truncate font-medium text-sm">
						{session.user.name}
					</span>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-56 border bg-card shadow-lg"
				align="end"
			>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="font-medium text-sm leading-none">
							{session.user.name}
						</p>
						<p className="truncate text-muted-foreground text-xs leading-none">
							{session.user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="cursor-pointer text-destructive focus:text-destructive"
					onClick={() => {
						authClient.signOut({
							fetchOptions: {
								onSuccess: () => {
									router.push("/");
								},
							},
						});
					}}
				>
					<LogOut className="mr-2 size-4" />
					<span>Sign Out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
