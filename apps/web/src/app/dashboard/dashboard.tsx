"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

// Tab components
import OverviewTab from "./components/OverviewTab";
import FoodLogTab from "./components/FoodLogTab";
import ReflectionTab from "./components/ReflectionTab";
import InsightsTab from "./components/InsightsTab";
import SettingsTab from "./components/SettingsTab";

// Types local to dashboard for prop consistency
type FoodEntry = {
	id: string;
	type: "breakfast" | "lunch" | "dinner" | "snack" | "drink";
	description: string;
	time: string;
	feeling?: number;
	date?: string;
};

type DailyReflection = {
	id?: string;
	overallFeeling: number;
	energy: number;
	mood: number;
	sleep: number;
	digestion: number;
	notes?: string;
	date?: string;
};

type TrackingItem = {
	id: string;
	name: string;
	category: string;
	type?: string;
	unit?: string;
};

type NewEntry = {
	type: "breakfast" | "lunch" | "dinner" | "snack" | "drink";
	description: string;
	time: string;
};

export default function Dashboard() {
	const { data: session } = authClient.useSession();
	const searchParams = useSearchParams();
	const activeTab = searchParams.get("tab") ?? "overview";
	const today = useMemo(() => new Date().toISOString().split("T")[0], []);

	// Core dashboard state
	const [userTrackingItems, setUserTrackingItems] = useState<TrackingItem[]>(
		[],
	);
	const [todaysFoodEntries, setTodaysFoodEntries] = useState<FoodEntry[]>([]);
	const [newEntry, setNewEntry] = useState<NewEntry>({
		type: "breakfast",
		description: "",
		time: "",
	});
	const [showReflection, setShowReflection] = useState(false);
	const [reflection, setReflection] = useState<DailyReflection>({
		overallFeeling: 5,
		energy: 5,
		mood: 5,
		sleep: 5,
		digestion: 5,
		notes: "",
	});

	// Fetch user-selected tracking items
	const fetchUserTrackingItems = useCallback(async () => {
		try {
			const res = await fetch("/api/user-selections");
			if (!res.ok) return;

			const data = await res.json();
			const items = Array.isArray(data)
				? data.map((selection: any) => selection?.trackingItem).filter(Boolean)
				: [];
			setUserTrackingItems(items);
		} catch (error) {
			console.error("Error fetching user tracking items:", error);
		}
	}, []);

	// Fetch today's reflection record (if any)
	const fetchTodaysReflection = useCallback(async () => {
		try {
			const res = await fetch(`/api/daily-reflections?date=${today}`);
			if (!res.ok) return;

			const data = await res.json();
			const record = Array.isArray(data)
				? data[0]
				: Array.isArray(data?.data)
					? data.data[0]
					: data;

			if (record) {
				// We only know there is a record for today; keep local sliders as-is.
				setReflection((prev) => ({ ...prev, date: record.date || today }));
			} else {
				setReflection((prev) => ({ ...prev, date: undefined }));
			}
		} catch (error) {
			console.error("Error fetching daily reflection:", error);
		}
	}, [today]);

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
				return <span>🍿</span>;
			case "drink":
				return <span>🥤</span>;
			default:
				return <span>🍽️</span>;
		}
	}, []);

	const getFoodTypeColor = useCallback((type: string) => {
		switch (type) {
			case "breakfast":
				return "bg-amber-100 text-amber-800";
			case "lunch":
				return "bg-green-100 text-green-800";
			case "dinner":
				return "bg-indigo-100 text-indigo-800";
			case "snack":
				return "bg-pink-100 text-pink-800";
			case "drink":
				return "bg-cyan-100 text-cyan-800";
			default:
				return "bg-muted text-foreground";
		}
	}, []);

	// Consolidated refresh
	const refreshData = useCallback(async () => {
		await Promise.all([fetchUserTrackingItems(), fetchTodaysReflection()]);
	}, [fetchUserTrackingItems, fetchTodaysReflection]);

	// Initial load
	useEffect(() => {
		refreshData();
	}, [refreshData]);

	// Render content based on query param
	const renderTabContent = useCallback(() => {
		switch (activeTab) {
			case "food-log":
				return (
					<FoodLogTab
						newEntry={newEntry}
						setNewEntry={setNewEntry}
						addFoodEntry={addFoodEntry}
						todayEntries={todaysFoodEntries}
						getTypeIcon={getFoodTypeIcon}
						getTypeColor={getFoodTypeColor}
					/>
				);
			case "reflection":
				return (
					<ReflectionTab
						showReflection={showReflection}
						setShowReflection={setShowReflection}
						reflection={reflection}
						setReflection={setReflection}
					/>
				);
			case "insights":
				return <InsightsTab />;
			case "settings":
				return <SettingsTab userTrackingItems={userTrackingItems} />;
			case "overview":
			default:
				// Interpret reflection presence as "completed" for overview status
				const reflectionCompleted = Boolean(reflection?.date);
				return (
					<OverviewTab
						todayEntries={todaysFoodEntries}
						showReflection={reflectionCompleted}
						reflection={reflection}
						userTrackingItems={userTrackingItems}
					/>
				);
		}
	}, [
		activeTab,
		addFoodEntry,
		getFoodTypeColor,
		getFoodTypeIcon,
		newEntry,
		reflection,
		showReflection,
		todaysFoodEntries,
		userTrackingItems,
	]);

	return (
		<div className="space-y-6 wrapperx font-jakarta w-full">
			<div className="flex items-center justify-between pb-4">
				<div>
					<h1 className="text-2xl font-bold">
						Hey {session?.user?.name ? ` ${session.user.name}` : ""}, How was
						your day?
					</h1>
				</div>
				<button
					className="px-4 py-2 text-sm rounded-md border hover:bg-muted transition-colors"
					onClick={refreshData}
				>
					Refresh
				</button>
			</div>
			<section className="w-full flex items-center justify-center">
				<div className="w-full">{renderTabContent()}</div>
			</section>
		</div>
	);
}
