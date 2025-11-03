"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus, Utensils } from "lucide-react";

interface FoodEntry {
	id: string;
	type: "breakfast" | "lunch" | "dinner" | "snack" | "drink";
	description: string;
	time: string;
	feeling?: number;
	date?: string;
}

type NewEntry = {
	type: "breakfast" | "lunch" | "dinner" | "snack" | "drink";
	description: string;
	time: string;
};

type FoodLogTabProps = {
	newEntry: NewEntry;
	setNewEntry: React.Dispatch<React.SetStateAction<NewEntry>>;
	addFoodEntry: () => Promise<void> | void;
	todayEntries: FoodEntry[];
	getTypeIcon: (type: string) => React.ReactNode;
	getTypeColor: (type: string) => string;
};

export default function FoodLogTab({
	newEntry,
	setNewEntry,
	addFoodEntry,
	todayEntries,
	getTypeIcon,
	getTypeColor,
}: FoodLogTabProps) {
	return (
		<div className="space-y-6">
			<Card className="hover:shadow-md transition-shadow">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Plus className="h-5 w-5" />
						Log Your Food
					</CardTitle>
					<CardDescription>
						Record what you're eating or drinking right now
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="text-sm font-medium mb-2 block">Type</label>
							<Select
								value={newEntry.type}
								onValueChange={(value) =>
									setNewEntry({
										...newEntry,
										type: value as NewEntry["type"],
									})
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select meal type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="breakfast">🌅 Breakfast</SelectItem>
									<SelectItem value="lunch">🍽️ Lunch</SelectItem>
									<SelectItem value="dinner">🌙 Dinner</SelectItem>
									<SelectItem value="snack">🍿 Snack</SelectItem>
									<SelectItem value="drink">🥤 Drink</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className="text-sm font-medium mb-2 block">
								Time (optional)
							</label>
							<Input
								type="time"
								value={newEntry.time}
								onChange={(e) =>
									setNewEntry({ ...newEntry, time: e.target.value })
								}
								placeholder="Leave empty for now"
								className="focus:ring-2 focus:ring-primary focus:border-transparent"
							/>
						</div>
					</div>
					<div>
						<label className="text-sm font-medium mb-2 block">
							What did you eat/drink?
						</label>
						<Input
							value={newEntry.description}
							onChange={(e) =>
								setNewEntry({ ...newEntry, description: e.target.value })
							}
							placeholder="e.g., Oatmeal with berries and honey"
							onKeyPress={(e) => e.key === "Enter" && addFoodEntry()}
							className="focus:ring-2 focus:ring-primary focus:border-transparent"
						/>
					</div>
					<Button
						onClick={addFoodEntry}
						className="w-full "
						disabled={!newEntry.description.trim()}
					>
						<Plus className="h-4 w-4" />
						Add Entry
					</Button>
				</CardContent>
			</Card>

			<Card className="hover:shadow-md transition-shadow">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Utensils className="h-5 w-5" />
						Today's Food Log
					</CardTitle>
					<CardDescription>
						{todayEntries.length === 0
							? "No entries yet today"
							: `${todayEntries.length} entries logged`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{todayEntries.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<div className="bg-muted/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
								<Utensils className="h-8 w-8 opacity-50" />
							</div>
							<p className="text-lg font-medium mb-2 text-foreground">
								Start your food journey
							</p>
							<p className="text-sm mb-4">
								Log your first meal to begin tracking your eating patterns
							</p>
							<div className="flex-center">
							<Button
								variant="outline"
								onClick={() => {
									const input = document.querySelector(
										'input[placeholder*="eat/drink"]',
									) as HTMLInputElement;
									input?.focus();
								}}
								className="text-sm mt-1"
							>
								<Plus className="h-4 w-4 mr-2" />
								Add your first entry
							</Button>
							</div>
						</div>
					) : (
						<div className="space-y-3">
							{todayEntries.map((entry, index) => (
								<div
									key={entry.id || index}
									className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
								>
									<div className="flex items-center gap-3">
										<Badge
											className={`${getTypeColor(entry.type)} flex items-center gap-1 px-3 py-1`}
										>
											{getTypeIcon(entry.type)}
											<span className="capitalize">{entry.type}</span>
										</Badge>
										<div>
											<p className="font-medium text-foreground">
												{entry.description}
											</p>
											<p className="text-sm text-muted-foreground">
												{entry.time || "Just now"}
											</p>
										</div>
									</div>
									<div className="text-sm text-muted-foreground">
										{new Date(entry.date || Date.now()).toLocaleTimeString(
											"en-US",
											{
												hour: "2-digit",
												minute: "2-digit",
											},
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
