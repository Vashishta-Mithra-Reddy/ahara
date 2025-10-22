"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import useSound from "use-sound";

export function ModeToggle() {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);
	const [click] = useSound("/click.wav", { volume: 0.2 });

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const toggleTheme = () => {
		setTheme(resolvedTheme === "light" ? "dark" : "light");
		click();
	};

	return (
		<>
			<div
				className={
					"relative flex cursor-pointer items-center border-2 border-transparent gap-2 rounded-xl px-4 py-3 text-center transition-all duration-300 hover:bg-foreground/5 hover:text-foreground/90"
				}
				onClick={toggleTheme}
			>
				<Sun className="size-6 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
				<Moon className="-rotate-90 absolute size-6 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			</div>
		</>
	);
}

export default ModeToggle;
