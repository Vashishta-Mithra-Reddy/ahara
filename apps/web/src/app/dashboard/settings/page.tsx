"use client";

import React, { useCallback, useEffect, useState } from "react";
import SettingsTab from "@/app/dashboard/components/SettingsTab";

// Types
type TrackingItem = {
	id: string;
	name: string;
	category: string;
	type?: string;
	unit?: string;
};

export default function SettingsPage() {
	const [userTrackingItems, setUserTrackingItems] = useState<TrackingItem[]>(
		[],
	);

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

	// Load data on mount
	useEffect(() => {
		fetchUserTrackingItems();
	}, [fetchUserTrackingItems]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between pb-4">
				<div>
					<h1 className="text-2xl font-bold">Settings</h1>
					<p className="text-muted-foreground">
						Manage your tracking preferences and account settings
					</p>
				</div>
			</div>
			<section className="w-full flex items-center justify-center">
				<div className="w-full">
					<SettingsTab userTrackingItems={userTrackingItems} />
				</div>
			</section>
		</div>
	);
}
