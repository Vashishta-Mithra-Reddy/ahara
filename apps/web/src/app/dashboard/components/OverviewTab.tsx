"use client";
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Utensils,
	Calendar,
	TrendingUp,
	CheckCircle,
	AlertCircle,
} from "lucide-react";

interface FoodEntry {
	id: string;
	type: "breakfast" | "lunch" | "dinner" | "snack" | "drink";
	description: string;
	time: string;
	feeling?: number;
	date?: string;
}

interface DailyReflection {
	id?: string;
	overallFeeling: number;
	energy: number;
	mood: number;
	sleep: number;
	digestion: number;
	notes?: string;
	date?: string;
}

interface TrackingItem {
	id: string;
	name: string;
	category: string;
	type?: string;
	unit?: string;
}

type OverviewTabProps = {
	todayEntries: FoodEntry[];
	showReflection: boolean;
	reflection: DailyReflection;
	userTrackingItems: TrackingItem[];
};

export default function OverviewTab({
	todayEntries,
	showReflection,
	reflection,
	userTrackingItems,
}: OverviewTabProps) {
	return (
		<div className="space-y-6 w-full">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="hover:shadow-md transition-shadow">
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Utensils className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">Today's Entries</p>
								<p className="text-2xl font-bold">{todayEntries.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="hover:shadow-md transition-shadow">
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Calendar className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">Reflection</p>
								<p className="text-2xl font-bold">
									{showReflection ? (
										<CheckCircle className="h-6 w-6 text-green-500" />
									) : (
										<AlertCircle className="h-6 w-6 text-orange-500" />
									)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="hover:shadow-md transition-shadow">
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<TrendingUp className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">Overall Feeling</p>
								<p className="text-2xl font-bold">
									{reflection.overallFeeling}/10
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="hover:shadow-md transition-shadow">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Today's Summary
					</CardTitle>
					<CardDescription>Quick overview of your day</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
							<span className="text-sm font-medium">Food Entries</span>
							<span className="text-sm text-muted-foreground">
								{todayEntries.length} logged
							</span>
						</div>
						<div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
							<span className="text-sm font-medium">Daily Reflection</span>
							<span className="text-sm text-muted-foreground">
								{showReflection ? "Completed" : "Pending"}
							</span>
						</div>
						<div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
							<span className="text-sm font-medium">Tracking Items</span>
							<span className="text-sm text-muted-foreground">
								{userTrackingItems.length} active
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
