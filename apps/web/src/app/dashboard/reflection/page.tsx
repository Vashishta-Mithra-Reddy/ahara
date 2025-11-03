"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReflectionTab from "@/app/dashboard/components/ReflectionTab";

// Types
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

export default function ReflectionPage() {
	const today = useMemo(() => new Date().toISOString().split("T")[0], []);
	const [showReflection, setShowReflection] = useState(false);
	const [reflection, setReflection] = useState<DailyReflection>({
		overallFeeling: 5,
		energy: 5,
		mood: 5,
		sleep: 5,
		digestion: 5,
		notes: "",
	});

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

	// Load data on mount
	useEffect(() => {
		fetchTodaysReflection();
	}, [fetchTodaysReflection]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between pb-4">
				<div>
					<h1 className="text-2xl font-bold">Daily Reflection</h1>
					<p className="text-muted-foreground">
						Reflect on your day and track your wellbeing
					</p>
				</div>
			</div>
			<section className="w-full flex items-center justify-center">
				<div className="w-full">
					<ReflectionTab
						showReflection={showReflection}
						setShowReflection={setShowReflection}
						reflection={reflection}
						setReflection={setReflection}
					/>
				</div>
			</section>
		</div>
	);
}
