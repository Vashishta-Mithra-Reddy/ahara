"use client";

import React, { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { Plus, X, Activity } from "lucide-react";

type TrackingItem = {
	id: string;
	name: string;
	category: string;
	description?: string;
};

type UserSelection = {
	id: string;
	trackingItemId: string;
	active: boolean;
	customName?: string;
	customAdded: boolean;
	trackingItem?: TrackingItem;
};

export default function EditTriggers() {
	const [defaultItems, setDefaultItems] = useState<TrackingItem[]>([]);
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
	const [customSelections, setCustomSelections] = useState<UserSelection[]>([]);
	const [newCustomItem, setNewCustomItem] = useState({
		name: "",
		category: "metric",
		description: "",
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [selectionsByItemId, setSelectionsByItemId] = useState<
		Record<string, UserSelection>
	>({});

	useEffect(() => {
		const load = async () => {
			setIsLoading(true);
			try {
				const [itemsRes, selectionsRes] = await Promise.all([
					fetch("/api/tracking-items?default=true"),
					fetch("/api/user-selections"),
				]);
				if (itemsRes.ok) {
					const items = await itemsRes.json();
					setDefaultItems(items);
				}
				if (selectionsRes.ok) {
					const selections: UserSelection[] = await selectionsRes.json();
					const activeSet = new Set<string>();
					const byItem: Record<string, UserSelection> = {};
					const customActives: UserSelection[] = [];
					for (const s of selections) {
						byItem[s.trackingItemId] = s;
						if (s.active) {
							activeSet.add(s.trackingItemId);
							if (s.customAdded) customActives.push(s);
						}
					}
					setSelectionsByItemId(byItem);
					setSelectedItems(activeSet);
					setCustomSelections(customActives);
				}
			} catch (error) {
				console.error("Error loading tracking data:", error);
				toast.error("Failed to load tracking options");
			} finally {
				setIsLoading(false);
			}
		};
		load();
	}, []);

	const handleItemToggle = (itemId: string) => {
		const next = new Set(selectedItems);
		if (next.has(itemId)) next.delete(itemId);
		else next.add(itemId);
		setSelectedItems(next);
	};

	const addCustomItem = async () => {
		if (!newCustomItem.name.trim()) {
			toast.error("Please enter a name for the tracking item");
			return;
		}
		try {
			// Create a global tracking item (custom)
			const createRes = await fetch("/api/tracking-items", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: newCustomItem.name.trim(),
					category: newCustomItem.category,
					description: newCustomItem.description.trim() || undefined,
					isDefault: false,
				}),
			});
			if (!createRes.ok) throw new Error("Failed to create tracking item");
			const createdRaw = await createRes.json();
			const createdItem = Array.isArray(createdRaw) ? createdRaw[0] : createdRaw;
			if (!createdItem?.id) throw new Error("Invalid tracking item response");

			// Create the user's selection for the newly created item
			const selectRes = await fetch("/api/user-selections", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					trackingItemId: createdItem.id,
					active: true,
					customAdded: true,
				}),
			});
			if (!selectRes.ok) throw new Error("Failed to create selection");
			const selectionRaw = await selectRes.json();
			const selection = Array.isArray(selectionRaw) ? selectionRaw[0] : selectionRaw;
			if (!selection?.trackingItemId) throw new Error("Invalid selection response");

			setSelectionsByItemId((prev) => ({
				...prev,
				[selection.trackingItemId]: selection,
			}));
			setSelectedItems((prev) => new Set([...prev, selection.trackingItemId]));
			setCustomSelections((prev) => [selection, ...prev]);
			setNewCustomItem({ name: "", category: "metric", description: "" });
			toast.success(`Added "${createdItem.name}"`);
		} catch (error) {
			console.error(error);
			toast.error("Failed to add custom item");
		}
	};

	const removeCustomItem = async (selectionId: string) => {
		try {
			const res = await fetch("/api/user-selections", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: selectionId, active: false }),
			});
			if (!res.ok) throw new Error("Failed to update selection");

			const updated = await res.json();
			const updatedSel = Array.isArray(updated)
				? (updated[0] ?? null)
				: updated;
			if (updatedSel) {
				setCustomSelections((prev) => prev.filter((s) => s.id !== selectionId));
				setSelectedItems((prev) => {
					const next = new Set(prev);
					next.delete(updatedSel.trackingItemId);
					return next;
				});
				setSelectionsByItemId((prev) => ({
					...prev,
					[updatedSel.trackingItemId]: updatedSel,
				}));
			}
			toast.success("Removed custom item");
		} catch (error) {
			console.error(error);
			toast.error("Failed to remove item");
		}
	};

	const saveChanges = async () => {
		setIsSaving(true);
		try {
			const ops: Promise<Response>[] = [];
			for (const item of defaultItems) {
				const selected = selectedItems.has(item.id);
				const existing = selectionsByItemId[item.id];
				if (selected) {
					if (existing) {
						if (!existing.active) {
							ops.push(
								fetch("/api/user-selections", {
									method: "PATCH",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({ id: existing.id, active: true }),
								}),
							);
						}
					} else {
						ops.push(
							fetch("/api/user-selections", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ trackingItemId: item.id, active: true }),
							}),
						);
					}
				} else {
					if (existing && existing.active) {
						ops.push(
							fetch("/api/user-selections", {
								method: "PATCH",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ id: existing.id, active: false }),
							}),
						);
					}
				}
			}
			await Promise.all(ops);
			toast.success("Tracking selections updated");
		} catch (error) {
			console.error(error);
			toast.error("Failed to save changes");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-6">
			<Card className="shadow-none hover:shadow-md transition-all duration-500">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Activity className="h-5 w-5" />
						Edit Tracking Items
					</CardTitle>
					<CardDescription>
						Select the default items you want to track and manage your custom
						items
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{isLoading ? (
						<div className="text-sm text-muted-foreground">Loading...</div>
					) : (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{defaultItems.map((item) => (
									<div
										key={item.id}
										className={`p-4 border rounded-lg cursor-pointer transition-all ${
											selectedItems.has(item.id)
												? "border-primary bg-primary/5 shadow-sm"
												: "border-border"
										}`}
										onClick={() => handleItemToggle(item.id)}
									>
										<div className="flex items-start gap-3">
											<Checkbox
												checked={selectedItems.has(item.id)}
												onCheckedChange={() => handleItemToggle(item.id)}
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

							{/* Custom item form and button remain unchanged */}
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
									<select
										id="custom-category"
										value={newCustomItem.category}
										onChange={(e) =>
											setNewCustomItem({
												...newCustomItem,
												category: e.target.value,
											})
										}
										className="w-full h-9 px-3 py-1 text-sm border border-input rounded-md bg-background"
									>
										<option value="metric">Metric</option>
										<option value="symptom">Symptom</option>
									</select>
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
									<Button onClick={addCustomItem} size="sm" className="w-full">
										<Plus className="h-4 w-4 mr-1" />
										Add
									</Button>
								</div>
							</div>

							{customSelections.length > 0 && (
								<div className="space-y-2">
									<Label className="text-sm font-medium">
										Your Custom Items:
									</Label>
									<div className="flex flex-wrap gap-2">
										{customSelections.map((sel) => (
											<Badge
												key={sel.id}
												variant="secondary"
												className="flex items-center gap-2 px-3 py-1"
											>
												<span>{sel.customName || sel.trackingItem?.name}</span>
												<Badge variant="outline" className="text-xs">
													{sel.trackingItem?.category || "custom"}
												</Badge>
												<button
													onClick={() => removeCustomItem(sel.id)}
													className="ml-1 hover:text-destructive"
												>
													<X className="h-3 w-3" />
												</button>
											</Badge>
										))}
									</div>
								</div>
							)}

							<div className="flex justify-end">
								<Button onClick={saveChanges} disabled={isSaving}>
									{isSaving ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
