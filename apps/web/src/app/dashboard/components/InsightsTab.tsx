"use client";
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function InsightsTab() {
	return (
		<div className="space-y-6">
			<Card className="hover:shadow-md transition-shadow">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						Your Insights
					</CardTitle>
					<CardDescription>
						Patterns and trends from your food tracking
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center py-12 text-muted-foreground">
						<div className="bg-muted/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
							<BarChart3 className="h-8 w-8 opacity-50" />
						</div>
						<p className="text-lg font-medium mb-2 text-foreground">
							Insights Coming Soon
						</p>
						<p className="text-sm mb-4">
							Keep logging your food to unlock personalized insights
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
