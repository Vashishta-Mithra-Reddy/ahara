"use client";

import React from "react";
import InsightsTab from "@/app/dashboard/components/InsightsTab";

export default function InsightsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between pb-4">
				<div>
					<h1 className="text-2xl font-bold">Insights</h1>
					<p className="text-muted-foreground">
						Discover patterns and trends in your health data
					</p>
				</div>
			</div>
			<section className="w-full flex items-center justify-center">
				<div className="w-full">
					<InsightsTab />
				</div>
			</section>
		</div>
	);
}
