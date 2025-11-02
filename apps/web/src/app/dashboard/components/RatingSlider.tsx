"use client";
import React from "react";

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
		<div className="space-y-3 p-4 bg-muted/30 rounded-lg">
			<div className="flex justify-between items-center">
				<label className="text-sm font-medium text-foreground">{label}</label>
				<span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
					{value}/10
				</span>
			</div>
			<input
				type="range"
				min="1"
				max="10"
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-primary"
				style={{
					background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(value - 1) * 11.11}%, #e5e7eb ${(value - 1) * 11.11}%, #e5e7eb 100%)`,
				}}
			/>
			<div className="flex justify-between text-xs text-muted-foreground">
				<span>Poor</span>
				<span>Excellent</span>
			</div>
		</div>
	);
}
