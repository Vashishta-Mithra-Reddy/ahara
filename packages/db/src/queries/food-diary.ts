import { db } from "../index";
import {
	trackingItem,
	userTrackingSelection,
	userOnboardingStatus,
	triggerEntry,
	trackingLog,
	reminderSettings,
	dailyCheckIn,
	patternInsight,
} from "../schema/food-diary";
import { user } from "../schema/auth";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";

// Tracking Item Queries
export const getDefaultTrackingItems = async () => {
	return await db
		.select()
		.from(trackingItem)
		.where(eq(trackingItem.isDefault, true))
		.orderBy(asc(trackingItem.name));
};

export const getAllTrackingItems = async () => {
	return await db
		.select()
		.from(trackingItem)
		.orderBy(asc(trackingItem.name));
};

export const createTrackingItem = async (data: {
	name: string;
	category: string;
	description?: string;
	isDefault?: boolean;
}) => {
	return await db.insert(trackingItem).values({
		...data,
		createdAt: new Date(),
		updatedAt: new Date(),
	}).returning();
};

// User Tracking Selection Queries
export const getUserTrackingSelections = async (userId: string) => {
	return await db
		.select({
			id: userTrackingSelection.id,
			trackingItemId: userTrackingSelection.trackingItemId,
			active: userTrackingSelection.active,
			customName: userTrackingSelection.customName,
			customAdded: userTrackingSelection.customAdded,
			trackingItem: trackingItem,
		})
		.from(userTrackingSelection)
		.leftJoin(trackingItem, eq(userTrackingSelection.trackingItemId, trackingItem.id))
		.where(eq(userTrackingSelection.userId, userId))
		.orderBy(asc(trackingItem.name));
};

export const createUserTrackingSelection = async (data: {
	userId: string;
	trackingItemId: string;
	active?: boolean;
	customName?: string;
	customAdded?: boolean;
}) => {
	return await db.insert(userTrackingSelection).values({
		...data,
		createdAt: new Date(),
		updatedAt: new Date(),
	}).returning();
};

export const updateUserTrackingSelection = async (id: string, data: Partial<{
	active: boolean;
	customName: string;
}>) => {
	return await db
		.update(userTrackingSelection)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(userTrackingSelection.id, id))
		.returning();
};

// Onboarding Queries
export const getUserOnboardingStatus = async (userId: string) => {
	return await db
		.select()
		.from(userOnboardingStatus)
		.where(eq(userOnboardingStatus.userId, userId))
		.limit(1);
};

export const createUserOnboardingStatus = async (data: {
	userId: string;
	completed?: boolean;
	completedAt?: Date;
}) => {
	return await db.insert(userOnboardingStatus).values({
		...data,
		createdAt: new Date(),
		updatedAt: new Date(),
	}).returning();
};

export const updateUserOnboardingStatus = async (userId: string, data: Partial<{
	completed: boolean;
	completedAt: Date;
}>) => {
	return await db
		.update(userOnboardingStatus)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(userOnboardingStatus.userId, userId))
		.returning();
};

// Trigger Entry Queries
export const createTriggerEntry = async (data: {
	userId: string;
	name: string;
	description?: string;
	category: string;
	subcategory?: string;
	intensity?: number;
	duration?: number;
	loggedAt: Date;
}) => {
	return await db.insert(triggerEntry).values({
		...data,
		createdAt: new Date(),
		updatedAt: new Date(),
	}).returning();
};

export const getTriggerEntriesByDate = async (userId: string, date: Date) => {
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(date);
	endOfDay.setHours(23, 59, 59, 999);

	return await db
		.select()
		.from(triggerEntry)
		.where(
			and(
				eq(triggerEntry.userId, userId),
				gte(triggerEntry.loggedAt, startOfDay),
				lte(triggerEntry.loggedAt, endOfDay)
			)
		)
		.orderBy(asc(triggerEntry.loggedAt));
};

export const getTriggerEntriesByUser = async (userId: string, limit = 50) => {
	return await db
		.select()
		.from(triggerEntry)
		.where(eq(triggerEntry.userId, userId))
		.orderBy(desc(triggerEntry.loggedAt))
		.limit(limit);
};

// Tracking Log Queries
export const createTrackingLog = async (data: {
	userId: string;
	trackingItemId: string;
	value: number;
	date: Date;
	notes?: string;
}) => {
	return await db.insert(trackingLog).values({
		...data,
		createdAt: new Date(),
		updatedAt: new Date(),
	}).returning();
};

export const getTrackingLogsByDate = async (userId: string, date: Date) => {
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(date);
	endOfDay.setHours(23, 59, 59, 999);

	return await db
		.select({
			id: trackingLog.id,
			value: trackingLog.value,
			date: trackingLog.date,
			notes: trackingLog.notes,
			trackingItem: trackingItem,
		})
		.from(trackingLog)
		.leftJoin(trackingItem, eq(trackingLog.trackingItemId, trackingItem.id))
		.where(
			and(
				eq(trackingLog.userId, userId),
				gte(trackingLog.date, startOfDay),
				lte(trackingLog.date, endOfDay)
			)
		)
		.orderBy(asc(trackingLog.date));
};

export const updateTrackingLog = async (id: string, data: Partial<{
	value: number;
	notes: string;
}>) => {
	return await db
		.update(trackingLog)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(trackingLog.id, id))
		.returning();
};

// Pattern Insight Queries
export const createPatternInsight = async (data: {
	userId: string;
	triggerName: string;
	affectedTrackingItemId: string;
	patternType: string;
	correlationStrength?: string;
	confidence?: string;
	description?: string;
	occurrences?: number;
	lastObserved: Date;
}) => {
	return await db.insert(patternInsight).values({
		...data,
		createdAt: new Date(),
		updatedAt: new Date(),
	}).returning();
};

export const getPatternInsightsByUser = async (userId: string) => {
	return await db
		.select({
			id: patternInsight.id,
			triggerName: patternInsight.triggerName,
			patternType: patternInsight.patternType,
			correlationStrength: patternInsight.correlationStrength,
			confidence: patternInsight.confidence,
			description: patternInsight.description,
			occurrences: patternInsight.occurrences,
			lastObserved: patternInsight.lastObserved,
			isActive: patternInsight.isActive,
			trackingItem: trackingItem,
		})
		.from(patternInsight)
		.leftJoin(trackingItem, eq(patternInsight.affectedTrackingItemId, trackingItem.id))
		.where(eq(patternInsight.userId, userId))
		.orderBy(desc(patternInsight.lastObserved));
};

// Reminder Settings Queries
// createReminderSettings (remove window durations; add getAllReminderSettings)
export const createReminderSettings = async (data: {
    userId: string;
    timezone?: string;
    dailyLogReminder?: boolean;
    logReminderTime?: string;
    symptomCheckReminder?: boolean;
    symptomCheckTime?: string;
}) => {
    return await db.insert(reminderSettings).values({
        userId: data.userId,
        timezone: data.timezone,
        dailyLogReminder: data.dailyLogReminder,
        logReminderTime: data.logReminderTime,
        symptomCheckReminder: data.symptomCheckReminder,
        symptomCheckTime: data.symptomCheckTime,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning();
};

export const getReminderSettingsByUser = async (userId: string) => {
    return await db
        .select()
        .from(reminderSettings)
        .where(eq(reminderSettings.userId, userId))
        .orderBy(desc(reminderSettings.updatedAt))
        .limit(1);
};

export const updateReminderSettings = async (userId: string, data: Partial<{
    timezone: string;
    dailyLogReminder: boolean;
    logReminderTime: string;
    symptomCheckReminder: boolean;
    symptomCheckTime: string;
}>) => {
    return await db
        .update(reminderSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(reminderSettings.userId, userId))
        .returning();
};

// Daily Check-in Queries
export const createDailyCheckIn = async (data: {
	userId: string;
	date: Date;
	hasLoggedTriggers?: boolean;
	hasLoggedSymptoms?: boolean;
	// split reminder flags
	logReminderSent?: boolean;
	symptomReminderSent?: boolean;
}) => {
	return await db.insert(dailyCheckIn).values({
		...data,
		createdAt: new Date(),
		updatedAt: new Date(),
	}).returning();
};

// New: fetch user's check-in for a specific local date (start/end of day)
export const getDailyCheckInByDate = async (userId: string, date: Date) => {
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(date);
	endOfDay.setHours(23, 59, 59, 999);

	return await db
		.select()
		.from(dailyCheckIn)
		.where(
			and(
				eq(dailyCheckIn.userId, userId),
				gte(dailyCheckIn.date, startOfDay),
				lte(dailyCheckIn.date, endOfDay),
			),
		)
		.limit(1);
};

// New: fetch user's check-in within a provided UTC range (for local-day windows)
export const getDailyCheckInByUserDateRange = async (userId: string, start: Date, end: Date) => {
	return await db
		.select()
		.from(dailyCheckIn)
		.where(
			and(
				eq(dailyCheckIn.userId, userId),
				gte(dailyCheckIn.date, start),
				lte(dailyCheckIn.date, end),
			),
		)
		.limit(1);
};

export const updateDailyCheckIn = async (id: string, data: Partial<{
	hasLoggedTriggers: boolean;
	hasLoggedSymptoms: boolean;
	// split reminder flags
	logReminderSent: boolean;
	symptomReminderSent: boolean;
}>) => {
	return await db
		.update(dailyCheckIn)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(dailyCheckIn.id, id))
		.returning();
};

// Helper: fetch user (for email)
export const getUserById = async (id: string) => {
	return await db
		.select()
		.from(user)
		.where(eq(user.id, id))
		.limit(1);
};

// Update incomplete check-ins query to respect split flags
export const getIncompleteCheckIns = async (date: Date) => {
	return await db
		.select()
		.from(dailyCheckIn)
		.where(
			and(
				eq(dailyCheckIn.date, date),
				sql`(${dailyCheckIn.hasLoggedTriggers} = false OR ${dailyCheckIn.hasLoggedSymptoms} = false)`,
				sql`(${dailyCheckIn.logReminderSent} = false OR ${dailyCheckIn.symptomReminderSent} = false)`
			)
		);
};

export const getAllReminderSettings = async () => {
	return await db
		.select()
		.from(reminderSettings);
};