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
import { Textarea } from "@/components/ui/textarea";
import { Moon } from "lucide-react";
import { toast } from "sonner";
import RatingSlider from "./RatingSlider";

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

type ReflectionTabProps = {
	showReflection: boolean;
	setShowReflection: (val: boolean) => void;
	reflection: DailyReflection;
	setReflection: React.Dispatch<React.SetStateAction<DailyReflection>>;
};

export default function ReflectionTab({
	showReflection,
	setShowReflection,
	reflection,
	setReflection,
}: ReflectionTabProps) {
	return (
		<div className="space-y-6">
			<Card className="hover:shadow-md transition-shadow">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Moon className="h-5 w-5" />
						Daily Reflection
					</CardTitle>
					<CardDescription>
						How did your body and mind feel today? Reflect before sleeping or
						after waking up.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!showReflection ? (
						<div className="text-center py-6">
							<Moon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
							<p className="text-lg font-medium mb-2">Ready to reflect?</p>
							<p className="text-sm text-muted-foreground mb-4">
								Take a moment to check in with yourself and how you're feeling
							</p>
							<Button
								onClick={() => setShowReflection(true)}
								className="bg-primary hover:bg-primary/90 transition-colors"
							>
								<Moon className="h-4 w-4 mr-2" />
								Start Daily Reflection
							</Button>
						</div>
					) : (
						<div className="space-y-6">
							<RatingSlider
								label="Overall Feeling"
								value={reflection.overallFeeling}
								onChange={(value) =>
									setReflection({ ...reflection, overallFeeling: value })
								}
							/>
							<RatingSlider
								label="Energy Level"
								value={reflection.energy}
								onChange={(value) =>
									setReflection({ ...reflection, energy: value })
								}
							/>
							<RatingSlider
								label="Mood"
								value={reflection.mood}
								onChange={(value) =>
									setReflection({ ...reflection, mood: value })
								}
							/>
							<RatingSlider
								label="Sleep Quality"
								value={reflection.sleep}
								onChange={(value) =>
									setReflection({ ...reflection, sleep: value })
								}
							/>
							<RatingSlider
								label="Digestion"
								value={reflection.digestion}
								onChange={(value) =>
									setReflection({ ...reflection, digestion: value })
								}
							/>

							<div>
								<label className="text-sm font-medium mb-2 block">
									Additional Notes (optional)
								</label>
								<Textarea
									value={reflection.notes}
									onChange={(e) =>
										setReflection({ ...reflection, notes: e.target.value })
									}
									placeholder="Any specific observations about how food affected you today?"
									rows={3}
								/>
							</div>

							<div className="flex gap-2">
								<Button
									onClick={async () => {
										try {
											const today = new Date().toISOString().split("T")[0];
											const response = await fetch("/api/daily-reflections", {
												method: "POST",
												headers: { "Content-Type": "application/json" },
												body: JSON.stringify({
													date: today,
													...reflection,
												}),
											});

											if (response.ok) {
												toast.success("Daily reflection saved!");
												setShowReflection(false);
											} else {
												toast.error("Failed to save reflection");
											}
										} catch (error) {
											console.error("Error saving reflection:", error);
											toast.error(
												"An error occurred while saving the reflection",
											);
										}
									}}
									className="flex-1"
								>
									Save Reflection
								</Button>
								<Button
									variant="outline"
									onClick={() => setShowReflection(false)}
								>
									Cancel
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
