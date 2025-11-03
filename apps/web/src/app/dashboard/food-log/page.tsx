"use client";

import React, { useCallback, useState } from "react";
import FoodLogTab from "@/app/dashboard/components/FoodLogTab";

// Types
type FoodEntry = {
	id: string;
	type: "breakfast" | "lunch" | "dinner" | "snack" | "drink";
	description: string;
	time: string;
	feeling?: number;
	date?: string;
};

type NewEntry = {
	type: "breakfast" | "lunch" | "dinner" | "snack" | "drink";
	description: string;
	time: string;
};

export default function FoodLogPage() {
	const [todaysFoodEntries, setTodaysFoodEntries] = useState<FoodEntry[]>([]);
	const [newEntry, setNewEntry] = useState<NewEntry>({
		type: "breakfast",
		description: "",
		time: "",
	});

	// Add a food entry locally (client-side log for now)
	const addFoodEntry = useCallback(() => {
		if (!newEntry.description.trim()) return;

		const id =
			typeof crypto !== "undefined" && "randomUUID" in crypto
				? crypto.randomUUID()
				: Math.random().toString(36).slice(2);

		const now = new Date();
		const hh = now.getHours().toString().padStart(2, "0");
		const mm = now.getMinutes().toString().padStart(2, "0");

		setTodaysFoodEntries((prev) => [
			{
				id,
				type: newEntry.type,
				description: newEntry.description.trim(),
				time: newEntry.time || `${hh}:${mm}`,
				date: now.toISOString(),
			},
			...prev,
		]);
		setNewEntry({ type: "breakfast", description: "", time: "" });
	}, [newEntry]);

	// Icon and color helpers for FoodLogTab badges
	const getFoodTypeIcon = useCallback((type: string) => {
		switch (type) {
			case "breakfast":
				return <span>🌅</span>;
			case "lunch":
				return <span>🍽️</span>;
			case "dinner":
				return <span>🌙</span>;
			case "snack":
				return <span>🍎</span>;
			case "drink":
				return <span>🥤</span>;
			default:
				return <span>🍽️</span>;
		}
	}, []);

	const getFoodTypeColor = useCallback((type: string) => {
		switch (type) {
			case "breakfast":
				return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
			case "lunch":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "dinner":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
			case "snack":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
			case "drink":
				return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
		}
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between pb-4">
				<div>
					<h1 className="text-2xl font-bold">Food Log</h1>
					<p className="text-muted-foreground">Track your daily food intake</p>
				</div>
			</div>
			<section className="w-full flex items-center justify-center">
				<div className="w-full">
					<FoodLogTab
						addFoodEntry={addFoodEntry}
						getTypeColor={getFoodTypeColor}
						getTypeIcon={getFoodTypeIcon}
						newEntry={newEntry}
						setNewEntry={setNewEntry}
						todayEntries={todaysFoodEntries}
					/>
				</div>
			</section>
		</div>
	);
}
