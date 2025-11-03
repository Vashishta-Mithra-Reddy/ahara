"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type RatingSliderProps = {
	label: string;
	value: number;
	onChange: (value: number) => void;
};

export default function RatingSlider({
	label,
	value,
	onChange,
}: RatingSliderProps) {
	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<label className="text-sm font-medium text-foreground">{label}</label>
			</div>

			{/* Numbered Button Selection */}
			<div className="p-2 bg-muted/30 rounded-xl border-2 border-dashed">
				<div className="flex gap-0 relative overflow-hidden rounded-lg">
					{/* Animated background fill */}
					<motion.div
						className="absolute top-0 left-0 h-full bg-foreground/80 rounded-lg"
						initial={false}
						animate={{
							width: `${(value / 10) * 100}%`,
						}}
						transition={{
							type: "spring",
							stiffness: 250,
							damping: 25,
						}}
					/>

					{/* Buttons */}
					{Array.from({ length: 10 }, (_, i) => i + 1).map((number) => {
						const isFilled = number <= value;
						const isEndOfFill = number === value;
						const isStart = number === 1;

						return (
							<motion.button
								key={number}
								onClick={() => onChange(number)}
								whileTap={{ scale: 0.95 }}
								whileHover={{ scale: 1.05 }}
								className={`flex-1 py-3 px-2 text-sm font-semibold relative z-10 transition-all duration-200
									${isFilled
										? "text-background"
										: "text-muted-foreground hover:text-foreground"
									}
									${isStart ? "rounded-l-lg" : ""}
									${isEndOfFill ? "rounded-r-lg" : ""}
								`}
							>
								{number}
							</motion.button>
						);
					})}
				</div>
			</div>

			<div className="flex justify-between text-xs text-muted-foreground px-2">
				<span>Poor</span>
				<span>Excellent</span>
			</div>
		</div>
	);
}
