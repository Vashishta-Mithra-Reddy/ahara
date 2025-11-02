
// Module: auth-wrapped tracking queries

import { auth } from "..";
import { 
	getDefaultTrackingItems,
	getAllTrackingItems,
	createTrackingItem,
	getUserTrackingSelections,
	createUserTrackingSelection,
	updateUserTrackingSelection,
	getUserOnboardingStatus,
	createUserOnboardingStatus,
	updateUserOnboardingStatus,
	createTriggerEntry,
	getTriggerEntriesByDate,
	getTriggerEntriesByUser,
	createTrackingLog,
	getTrackingLogsByDate,
	updateTrackingLog,
	createPatternInsight,
	getPatternInsightsByUser,
	createReminderSettings,
	getReminderSettingsByUser,
	updateReminderSettings,
	createDailyCheckIn,
	getDailyCheckInByDate,
	updateDailyCheckIn,
	getAllReminderSettings,
	getDailyCheckInByUserDateRange,
	getUserById
} from "@ahara/db";

// Tracking Items (auth-wrapped)
export async function getDefaultTrackingItemsForRequest(params: {
	headers: any;
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return await getDefaultTrackingItems();
}

export async function getAllTrackingItemsForRequest(params: {
	headers: any;
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return await getAllTrackingItems();
}

export async function createTrackingItemForRequest(params: {
	headers: any;
	payload: {
		name: string;
		category: string;
		description?: string;
		isDefault?: boolean;
	};
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return await createTrackingItem(params.payload);
}

// User Tracking Selections (auth-wrapped)
export async function getUserTrackingSelectionsForRequest(params: {
	headers: any;
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return await getUserTrackingSelections(session.user.id);
}

export async function createUserTrackingSelectionForRequest(params: {
	headers: any;
	payload: {
		trackingItemId: string;
		active?: boolean;
		customName?: string;
		customAdded?: boolean;
	};
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return await createUserTrackingSelection({
		userId: session.user.id,
		...params.payload,
	});
}

export async function updateUserTrackingSelectionForRequest(params: {
	headers: any;
	id: string;
	payload: {
		active?: boolean;
		customName?: string;
	};
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return await updateUserTrackingSelection(params.id, params.payload);
}

// Onboarding (auth-wrapped)
export async function getUserOnboardingStatusForRequest(params: {
	headers: any;
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return await getUserOnboardingStatus(session.user.id);
}

export async function createUserOnboardingStatusForRequest(params: {
	headers: any;
	payload: {
		completed?: boolean;
		completedAt?: Date;
	};
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return await createUserOnboardingStatus({
		userId: session.user.id,
		...params.payload,
	});
}

export async function updateUserOnboardingStatusForRequest(params: {
	headers: any;
	payload: {
		completed?: boolean;
		completedAt?: Date;
	};
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return await updateUserOnboardingStatus(session.user.id, params.payload);
}

// Trigger Entries (auth-wrapped)
export async function getTriggerEntriesByDateForRequest(params: {
	headers: any;
	date?: string | Date;
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	const dateObj =
		typeof params.date === "string" ? new Date(params.date) : params.date ?? new Date();
	return await getTriggerEntriesByDate(session.user.id, dateObj);
}

export async function createTriggerEntryForRequest(params: {
	headers: any;
	payload: {
		name: string;
		description?: string;
		category: string;
		subcategory?: string;
		intensity?: number;
		duration?: number;
		loggedAt?: string | Date;
	};
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	
	const loggedAt = params.payload.loggedAt 
		? (typeof params.payload.loggedAt === "string" ? new Date(params.payload.loggedAt) : params.payload.loggedAt)
		: new Date();

	return await createTriggerEntry({
		userId: session.user.id,
		name: params.payload.name,
		description: params.payload.description,
		category: params.payload.category,
		subcategory: params.payload.subcategory,
		intensity: params.payload.intensity,
		duration: params.payload.duration,
		loggedAt,
	});
}

// Tracking Logs (auth-wrapped)
export async function getTrackingLogsByDateForRequest(params: {
	headers: any;
	date?: string | Date;
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	const dateObj =
		typeof params.date === "string" ? new Date(params.date) : params.date ?? new Date();
	return await getTrackingLogsByDate(session.user.id, dateObj);
}

export async function createTrackingLogForRequest(params: {
	headers: any;
	payload: {
		trackingItemId: string;
		value: number;
		date?: string | Date;
		notes?: string;
	};
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	
	const date = params.payload.date 
		? (typeof params.payload.date === "string" ? new Date(params.payload.date) : params.payload.date)
		: new Date();

	return await createTrackingLog({
		userId: session.user.id,
		trackingItemId: params.payload.trackingItemId,
		value: params.payload.value,
		date,
		notes: params.payload.notes,
	});
}

export async function updateTrackingLogForRequest(params: {
	headers: any;
	id: string;
	payload: {
		value?: number;
		notes?: string;
	};
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return await updateTrackingLog(params.id, params.payload);
}

// Pattern Insights (auth-wrapped)
export async function getPatternInsightsByUserForRequest(params: {
	headers: any;
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return await getPatternInsightsByUser(session.user.id);
}

export async function createPatternInsightForRequest(params: {
	headers: any;
	payload: {
		triggerName: string;
		affectedTrackingItemId: string;
		patternType: string;
		correlationStrength?: string;
		confidence?: string;
		description?: string;
		occurrences?: number;
		lastObserved?: string | Date;
	};
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	
	const lastObserved = params.payload.lastObserved 
		? (typeof params.payload.lastObserved === "string" ? new Date(params.payload.lastObserved) : params.payload.lastObserved)
		: new Date();

	return await createPatternInsight({
		userId: session.user.id,
		triggerName: params.payload.triggerName,
		affectedTrackingItemId: params.payload.affectedTrackingItemId,
		patternType: params.payload.patternType,
		correlationStrength: params.payload.correlationStrength,
		confidence: params.payload.confidence,
		description: params.payload.description,
		occurrences: params.payload.occurrences,
		lastObserved,
	});
}

// Reminder Settings (auth-wrapped)
export async function getReminderSettingsByUserForRequest(params: {
	headers: any;
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return await getReminderSettingsByUser(session.user.id);
}

// createReminderSettingsForRequest (remove window durations)
export async function createReminderSettingsForRequest(params: {
	headers: any;
	payload: {
		timezone?: string;
		dailyLogReminder?: boolean;
		logReminderTime?: string;
		symptomCheckReminder?: boolean;
		symptomCheckTime?: string;
	};
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return await createReminderSettings({
		userId: session.user.id,
		...params.payload,
	});
}

export async function updateReminderSettingsForRequest(params: {
	headers: any;
	payload: {
		timezone?: string;
		dailyLogReminder?: boolean;
		logReminderTime?: string;
		symptomCheckReminder?: boolean;
		symptomCheckTime?: string;
	};
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return await updateReminderSettings(session.user.id, params.payload);
}

// Daily Check-in (auth-wrapped)
export async function getDailyCheckInByDateForRequest(params: {
	headers: any;
	date?: string | Date;
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	const dateObj =
		typeof params.date === "string" ? new Date(params.date) : params.date ?? new Date();
	return await getDailyCheckInByDate(session.user.id, dateObj);
}

export async function createDailyCheckInForRequest(params: {
	headers: any;
	payload: {
		date?: string | Date;
		hasLoggedTriggers?: boolean;
		hasLoggedSymptoms?: boolean;
		// split flags
		logReminderSent?: boolean;
		symptomReminderSent?: boolean;
	};
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	
	const date = params.payload.date 
		? (typeof params.payload.date === "string" ? new Date(params.payload.date) : params.payload.date)
		: new Date();

	return await createDailyCheckIn({
		userId: session.user.id,
		date,
		hasLoggedTriggers: params.payload.hasLoggedTriggers,
		hasLoggedSymptoms: params.payload.hasLoggedSymptoms,
		logReminderSent: params.payload.logReminderSent,
		symptomReminderSent: params.payload.symptomReminderSent,
	});
}

export async function updateDailyCheckInForRequest(params: {
	headers: any;
	id: string;
	payload: {
		hasLoggedTriggers?: boolean;
		hasLoggedSymptoms?: boolean;
		// split flags
		logReminderSent?: boolean;
		symptomReminderSent?: boolean;
	};
}) {
	const session = await auth.api.getSession({ headers: params.headers });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return await updateDailyCheckIn(params.id, params.payload);
}

// Service-level wrappers (no session; route enforces Bearer/HMAC)
export async function getAllReminderSettingsForServiceRequest(params: {
	headers: any;
}) {
	// Route handles authorization; wrapper just proxies to DB
	return await getAllReminderSettings();
}

export async function getDailyCheckInByUserDateRangeForServiceRequest(params: {
	headers: any;
	userId: string;
	start: Date;
	end: Date;
}) {
	return await getDailyCheckInByUserDateRange(params.userId, params.start, params.end);
}

export async function createDailyCheckInForServiceRequest(params: {
	headers: any;
	payload: {
		userId: string;
		date?: string | Date;
		hasLoggedTriggers?: boolean;
		hasLoggedSymptoms?: boolean;
		logReminderSent?: boolean;
		symptomReminderSent?: boolean;
	};
}) {
	const date =
		typeof params.payload.date === "string"
			? new Date(params.payload.date)
			: params.payload.date ?? new Date();

	return await createDailyCheckIn({
		userId: params.payload.userId,
		date,
		hasLoggedTriggers: params.payload.hasLoggedTriggers,
		hasLoggedSymptoms: params.payload.hasLoggedSymptoms,
		logReminderSent: params.payload.logReminderSent,
		symptomReminderSent: params.payload.symptomReminderSent,
	});
}

export async function updateDailyCheckInForServiceRequest(params: {
	headers: any;
	id: string;
	payload: {
		hasLoggedTriggers?: boolean;
		hasLoggedSymptoms?: boolean;
		logReminderSent?: boolean;
		symptomReminderSent?: boolean;
	};
}) {
	return await updateDailyCheckIn(params.id, params.payload);
}

export async function getUserByIdForServiceRequest(params: {
	headers: any;
	userId: string;
}) {
	return await getUserById(params.userId);
}