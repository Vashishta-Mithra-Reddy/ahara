"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus, X, CheckCircle, Activity } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import Spinner from "@/components/blocks/Spinner";

interface TrackingItem {
	id: string;
	name: string;
	category: string;
	description?: string;
	isDefault: boolean;
}

interface UserSelection {
	trackingItemId: string;
	active: boolean;
	customName?: string;
	customAdded: boolean;
}

export default function Onboarding() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const [defaultItems, setDefaultItems] = useState<TrackingItem[]>([]);
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
	const [customItems, setCustomItems] = useState<
		Array<{ name: string; category: string; description?: string }>
	>([]);
	const [newCustomItem, setNewCustomItem] = useState({
		name: "",
		category: "metric",
		description: "",
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!isPending && !session) {
			router.push("/login");
			return;
		}

		if (session) {
			fetchDefaultTrackingItems();
		}
	}, [session, isPending, router]);

	const fetchDefaultTrackingItems = async () => {
		try {
			const response = await fetch("/api/tracking-items?default=true");
			if (response.ok) {
				const items = await response.json();
				setDefaultItems(items);
				// Pre-select some common defaults
				const preSelected = items
					.filter((item: TrackingItem) =>
						["Mood", "Energy", "Sleep"].includes(item.name),
					)
					.map((item: TrackingItem) => item.id);
				setSelectedItems(new Set(preSelected));
			}
		} catch (error) {
			console.error("Error fetching default items:", error);
			toast.error("Failed to load tracking options");
		} finally {
			setIsLoading(false);
		}
	};

	const handleItemToggle = (itemId: string) => {
		const newSelected = new Set(selectedItems);
		if (newSelected.has(itemId)) {
			newSelected.delete(itemId);
		} else {
			newSelected.add(itemId);
		}
		setSelectedItems(newSelected);
	};

	const addCustomItem = () => {
		if (!newCustomItem.name.trim()) {
			toast.error("Please enter a name for the tracking item");
			return;
		}

		const customItem = {
			name: newCustomItem.name.trim(),
			category: newCustomItem.category,
			description: newCustomItem.description.trim() || undefined,
		};

		setCustomItems([...customItems, customItem]);
		setNewCustomItem({ name: "", category: "metric", description: "" });
		toast.success(`Added "${customItem.name}" to your tracking list`);
	};

	const removeCustomItem = (index: number) => {
		const newCustomItems = customItems.filter((_, i) => i !== index);
		setCustomItems(newCustomItems);
	};

	const completeOnboarding = async () => {
		if (selectedItems.size === 0 && customItems.length === 0) {
			toast.error("Please select at least one item to track");
			return;
		}

		setIsSaving(true);
		try {
			// First, create any custom tracking items
			const createdCustomItems: string[] = [];
			for (const customItem of customItems) {
				const response = await fetch("/api/tracking-items", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						...customItem,
						isDefault: false,
					}),
				});

				if (response.ok) {
					const created = await response.json();
					createdCustomItems.push(created.id);
				}
			}

			// Combine selected default items and created custom items
			const allSelectedItems = [
				...Array.from(selectedItems),
				...createdCustomItems,
			];

			// Create user selections for all selected items
			for (const itemId of allSelectedItems) {
				await fetch("/api/user-selections", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						trackingItemId: itemId,
						active: true,
						customAdded: createdCustomItems.includes(itemId),
					}),
				});
			}

			// Mark onboarding as completed (send timezone for defaults)
			const tz =
				typeof Intl !== "undefined"
					? Intl.DateTimeFormat().resolvedOptions().timeZone
					: "UTC";
			await fetch("/api/onboarding", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					completed: true,
					completedAt: new Date().toISOString(),
					timezone: tz,
				}),
			});

			toast.success("Onboarding completed! Welcome to Āhāra!");
			router.push("/dashboard");
		} catch (error) {
			console.error("Error completing onboarding:", error);
			toast.error("Failed to complete onboarding. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	if (isPending || isLoading) {
		return <Spinner />;
	}

	return (
		<div className="font-jakarta p-4 md:py-12 py-4">
			<div className="max-w-4xl mx-auto py-8">
				{/* Header */}
				<div className="text-center space-y-4 mb-12">
					<div className="flex flex-col items-center justify-center gap-2 mb-4">
						{/* <Target className="h-8 w-8 text-primary" /> */}

						<h1 className="text-3xl md:text-4xl font-bold font-jakarta flex flex-col">
							Start Understanding your body better
						</h1>
					</div>
					<p className="text-md md:text-xl text-muted-foreground max-w-2xl mx-auto">
						{/* Let's personalize your tracking and pattern analysis experience. */}
						Choose what you'd like to monitor and we'll help you discover
						meaningful insights.
					</p>
				</div>

				{/* Progress indicator */}
				{/* <div className="flex items-center justify-center gap-2 mb-8">
					<div className="flex items-center gap-2 text-primary">
						<span className="text-sm font-medium">Step 1: Choose Your Tracking Items</span>
					</div>
				</div> */}

				<div className="grid gap-6">
					{/* Default Tracking Items */}
					<Card className="shadow-none hover:shadow-md transition-all duration-500">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Activity className="h-5 w-5" />
								Default Tracking Items
							</CardTitle>
							<CardDescription>
								These are commonly tracked metrics and symptoms. Select the ones
								you'd like to monitor.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{defaultItems.map((item) => (
									<div
										key={item.id}
										className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
											selectedItems.has(item.id)
												? "border-primary bg-primary/5 shadow-sm"
												: "border-border"
										}`}
										onClick={() => handleItemToggle(item.id)}
									>
										<div className="flex items-start gap-3">
											<Checkbox
												checked={selectedItems.has(item.id)}
												onChange={() => handleItemToggle(item.id)}
												className="mt-1"
											/>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<h3 className="font-medium text-sm">{item.name}</h3>
													<Badge variant="outline" className="text-xs">
														{item.category}
													</Badge>
												</div>
												{item.description && (
													<p className="text-xs text-muted-foreground">
														{item.description}
													</p>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Custom Tracking Items */}
					<Card className="shadow-none hover:shadow-md transition-all duration-500">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Plus className="h-5 w-5" />
								Add Custom Tracking Items
							</CardTitle>
							<CardDescription>
								Don't see what you're looking for? Add your own custom tracking
								items.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Add new custom item form */}
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20">
								<div>
									<Label htmlFor="custom-name" className="text-sm mb-2">
										Name
									</Label>
									<Input
										id="custom-name"
										placeholder="e.g., Headache"
										value={newCustomItem.name}
										onChange={(e) =>
											setNewCustomItem({
												...newCustomItem,
												name: e.target.value,
											})
										}
									/>
								</div>
								<div>
									<Label htmlFor="custom-category" className="text-sm mb-2">
										Category
									</Label>
									<Select
										value={newCustomItem.category}
										onValueChange={(value) =>
											setNewCustomItem({
												...newCustomItem,
												category: value,
											})
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select a category" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="metric">Metric</SelectItem>
											<SelectItem value="symptom">Symptom</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="custom-description" className="text-sm mb-2">
										Description (optional)
									</Label>
									<Input
										id="custom-description"
										placeholder="Brief description"
										value={newCustomItem.description}
										onChange={(e) =>
											setNewCustomItem({
												...newCustomItem,
												description: e.target.value,
											})
										}
									/>
								</div>
								<div className="flex items-end">
									<Button
										onClick={addCustomItem}
										size="sm"
										className="w-full py-3"
									>
										<Plus className="h-4 w-4" />
										Add
									</Button>
								</div>
							</div>

							{/* Display added custom items */}
							{customItems.length > 0 && (
								<div className="space-y-2">
									<Label className="text-sm font-medium">
										Your Custom Items:
									</Label>
									<div className="flex flex-wrap gap-2">
										{customItems.map((item, index) => (
											<Badge
												key={index}
												variant="secondary"
												className="flex items-center gap-2 px-4 py-1"
											>
												<span>{item.name}</span>
												<Badge variant="outline" className="text-xs">
													{item.category}
												</Badge>
												<button
													onClick={() => removeCustomItem(index)}
													className="ml-1 hover:text-destructive"
												>
													<X className="h-3 w-3" />
												</button>
											</Badge>
										))}
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Summary and Complete */}
					<Card className="shadow-none hover:shadow-md transition-all duration-500">
						<CardHeader>
							<CardTitle>Summary</CardTitle>
							<CardDescription>
								You've selected {selectedItems.size + customItems.length} items
								to track.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{(selectedItems.size > 0 || customItems.length > 0) && (
									<div className="flex flex-wrap gap-2">
										{Array.from(selectedItems).map((itemId) => {
											const item = defaultItems.find((i) => i.id === itemId);
											return item ? (
												<Badge key={itemId} variant="default">
													{item.name}
												</Badge>
											) : null;
										})}
										{customItems.map((item, index) => (
											<Badge key={`custom-${index}`} variant="secondary">
												{item.name}
											</Badge>
										))}
									</div>
								)}

								<Separator />

								<div className="flex justify-center">
									<Button
										onClick={completeOnboarding}
										disabled={
											isSaving ||
											(selectedItems.size === 0 && customItems.length === 0)
										}
										className="w-full max-w-md"
									>
										{isSaving ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
												Completing Setup...
											</>
										) : (
											<>
												<CheckCircle className="h-4 w-4" />
												Complete Setup & Go to Dashboard
											</>
										)}
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
