"use client";

import React, { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell } from "lucide-react";

type ReminderSettingsRecord = {
	id?: string;
	dailyLogReminder: boolean;
	symptomCheckReminder: boolean;
	logReminderTime?: string;
	symptomCheckTime?: string;
	timezone?: string;
};

export default function ReminderSettings() {
	const defaultTz =
		typeof Intl !== "undefined"
			? Intl.DateTimeFormat().resolvedOptions().timeZone
			: "UTC";

	const [settings, setSettings] = useState<ReminderSettingsRecord>({
		dailyLogReminder: true,
		symptomCheckReminder: true,
		logReminderTime: "20:00",
		symptomCheckTime: "07:00",
		timezone: defaultTz,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		const load = async () => {
			try {
				const res = await fetch("/api/reminder-settings");
				if (res.ok) {
					const data = await res.json();
					const record = Array.isArray(data) ? data[0] : data;
					if (record) {
						setSettings({
							id: record.id,
							dailyLogReminder: !!record.dailyLogReminder,
							symptomCheckReminder: !!record.symptomCheckReminder,
							logReminderTime: (record.logReminderTime ?? "20:00").slice(0, 5),
							symptomCheckTime: (record.symptomCheckTime ?? "22:00").slice(0, 5),
							timezone: record.timezone ?? defaultTz,
						});
					}
				}
			} catch (error) {
				console.error("Error loading reminder settings:", error);
			} finally {
				setIsLoading(false);
			}
		};
		load();
	}, []);

	const save = async () => {
		setIsSaving(true);
		try {
			const method = settings.id ? "PUT" : "POST";
			const res = await fetch("/api/reminder-settings", {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					dailyLogReminder: settings.dailyLogReminder,
					symptomCheckReminder: settings.symptomCheckReminder,
					logReminderTime: settings.logReminderTime,
					symptomCheckTime: settings.symptomCheckTime,
					timezone: settings.timezone,
				}),
			});
			if (!res.ok) {
				throw new Error("Failed to save reminder settings");
			}

			const saved = await res.json();
			if (saved?.id) setSettings({ ...settings, id: saved.id });

			toast.success("Reminder settings saved");
		} catch (error) {
			console.error("Error saving reminder settings:", error);
			toast.error("Failed to save reminder settings");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Card className="shadow-none hover:shadow-md transition-all duration-500">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bell className="h-5 w-5" />
					Reminder Settings
				</CardTitle>
				<CardDescription>
					Control daily logging and symptom check reminders
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{isLoading ? (
					<div className="text-sm text-muted-foreground">Loading...</div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* toggles */}
							<div className="flex items-center gap-3">
								<Switch
									checked={settings.dailyLogReminder}
									onCheckedChange={(checked) =>
										setSettings({
											...settings,
											dailyLogReminder: !!checked,
										})
									}
								/>
								<div>
									<Label className="text-sm">Daily Log Reminder</Label>
									<p className="text-xs text-muted-foreground">
										Remind me to log food daily
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Switch
									checked={settings.symptomCheckReminder}
									onCheckedChange={(checked) =>
										setSettings({
											...settings,
											symptomCheckReminder: !!checked,
										})
									}
								/>
								<div>
									<Label className="text-sm">Symptom Check Reminder</Label>
									<p className="text-xs text-muted-foreground">
										Remind me to check symptoms
									</p>
								</div>
							</div>
							{/* times */}
							<div>
								<Label className="text-sm mb-2">Log Reminder Time</Label>
								<Input
									type="time"
									value={settings.logReminderTime ?? ""}
									onChange={(e) =>
										setSettings({
											...settings,
											logReminderTime: e.target.value,
										})
									}
								/>
							</div>
							<div>
								<Label className="text-sm mb-2">Symptom Reminder Time</Label>
								<Input
									type="time"
									value={settings.symptomCheckTime ?? ""}
									onChange={(e) =>
										setSettings({
											...settings,
											symptomCheckTime: e.target.value,
										})
									}
								/>
							</div>
							{/* timezone */}
							<div>
								<Label className="text-sm mb-2">Timezone</Label>
								<Input
									value={settings.timezone ?? ""}
									onChange={(e) =>
										setSettings({ ...settings, timezone: e.target.value })
									}
									placeholder="e.g., UTC, America/New_York"
								/>
							</div>
						</div>
						<div className="flex justify-end">
							<Button onClick={save} disabled={isSaving}>
								{isSaving ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
