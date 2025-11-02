"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import OverviewTab from "@/app/dashboard/components/OverviewTab";

// Types
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

export default function OverviewPage() {
	const { data: session } = authClient.useSession();
	const today = useMemo(() => new Date().toISOString().split("T")[0], []);

	// State
	const [userTrackingItems, setUserTrackingItems] = useState<TrackingItem[]>([]);
	const [todaysFoodEntries, setTodaysFoodEntries] = useState<FoodEntry[]>([]);
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
				setReflection((prev) => ({ ...prev, date: record.date || today }));
			} else {
				setReflection((prev) => ({ ...prev, date: undefined }));
			}
		} catch (error) {
			console.error("Error fetching daily reflection:", error);
		}
	}, [today]);

	// Refresh data
	const refreshData = useCallback(() => {
		fetchUserTrackingItems();
		fetchTodaysReflection();
	}, [fetchUserTrackingItems, fetchTodaysReflection]);

	// Load data on mount
	useEffect(() => {
		refreshData();
	}, [refreshData]);

	const reflectionCompleted = Boolean(reflection?.date);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between pb-4">
				<div>
					<h1 className="text-2xl font-bold">
						Hey {session?.user?.name ? ` ${session.user.name}` : ""}, How was your day?
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
				<div className="w-full">
					<OverviewTab
						todayEntries={todaysFoodEntries}
						showReflection={reflectionCompleted}
						reflection={reflection}
						userTrackingItems={userTrackingItems}
					/>
				</div>
			</section>
		</div>
	);
}