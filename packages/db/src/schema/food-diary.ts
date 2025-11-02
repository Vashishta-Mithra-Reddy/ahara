import {
	pgTable,
	text,
	timestamp,
	integer,
	decimal,
	time,
	boolean,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

/* ===============================
   TRACKABLE ITEMS (GLOBAL)
   =============================== */

// All possible metrics/symptoms in the system
export const trackingItem = pgTable("tracking_item", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(), // e.g., "Mood", "Energy", "Sleep", "Dandruff"
	category: text("category").notNull(), // "metric" | "symptom"
	description: text("description"),
	isDefault: boolean("is_default").notNull().default(false), // Defaults shown on onboarding
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ===============================
   USER-SPECIFIC TRACKING SELECTION
   =============================== */

export const userTrackingSelection = pgTable("user_tracking_selection", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	trackingItemId: uuid("tracking_item_id")
		.notNull()
		.references(() => trackingItem.id, { onDelete: "cascade" }),
	active: boolean("active").notNull().default(true), // True = user wants to track this
	customName: text("custom_name"), // If user renamed it
	customAdded: boolean("custom_added").notNull().default(false), // If user added their own tracking item
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ===============================
   ONBOARDING PROGRESS
   =============================== */

export const userOnboardingStatus = pgTable("user_onboarding_status", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" })
		.unique(),
	completed: boolean("completed").notNull().default(false),
	completedAt: timestamp("completed_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ===============================
   TRIGGERS
   =============================== */

export const triggerEntry = pgTable("trigger_entry", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	name: text("name").notNull(), // "Coconut Oil", "Skipped Breakfast"
	description: text("description"),
	category: text("category").notNull(), // "food", "drink", "product", "activity", "habit", etc.
	subcategory: text("subcategory"),
	intensity: integer("intensity"),
	duration: integer("duration_minutes"),
	loggedAt: timestamp("logged_at", { withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ===============================
   SYMPTOM / METRIC LOGS
   =============================== */

export const trackingLog = pgTable("tracking_log", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	trackingItemId: uuid("tracking_item_id")
		.notNull()
		.references(() => trackingItem.id, { onDelete: "cascade" }),
	value: integer("value").notNull(), // 1–10 scale
	date: timestamp("date", { withTimezone: true }).notNull(),
	notes: text("notes"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ===============================
   REMINDERS
   =============================== */

export const reminderSettings = pgTable("reminder_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Use unique() to enforce a one-to-one relationship
  // A user should only ever have one settings row.
  userId: text("user_id")
    .notNull()
    .unique() 
    .references(() => user.id, { onDelete: "cascade" }),

  // --- General Settings ---
  
  // Use a standard IANA timezone name (e.g., "Europe/London", "America/Los_Angeles")
  // The browser can provide this with: Intl.DateTimeFormat().resolvedOptions().timeZone
  timezone: text("timezone").notNull().default("UTC"),

  // --- Daily Log Reminder ---
  dailyLogReminder: boolean("daily_log_reminder").notNull().default(true),

  // Time-of-day (keep as time; timezone context comes from 'timezone' field)
  logReminderTime: time("log_reminder_time").notNull().default("20:00"),

  symptomCheckReminder: boolean("symptom_check_reminder").notNull().default(true),

  symptomCheckTime: time("symptom_check_time").notNull().default("07:00"),
  
  // --- Timestamps ---
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

/* ===============================
   DAILY CHECK-IN STATUS
   =============================== */

export const dailyCheckIn = pgTable("daily_check_in", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	date: timestamp("date", { withTimezone: true }).notNull(),
	hasLoggedTriggers: boolean("has_logged_triggers").notNull().default(false),
	hasLoggedSymptoms: boolean("has_logged_symptoms").notNull().default(false),
	logReminderSent: boolean("log_reminder_sent").notNull().default(false),
	symptomReminderSent: boolean("symptom_reminder_sent").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ===============================
   PATTERN INSIGHTS
   =============================== */

export const patternInsight = pgTable("pattern_insight", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	triggerName: text("trigger_name").notNull(),
	affectedTrackingItemId: uuid("affected_tracking_item_id")
		.notNull()
		.references(() => trackingItem.id, { onDelete: "cascade" }),
	patternType: text("pattern_type").notNull(), // "positive", "negative", "neutral"
	correlationStrength: decimal("correlation_strength", { precision: 3, scale: 2 }),
	confidence: decimal("confidence", { precision: 3, scale: 2 }),
	description: text("description"),
	occurrences: integer("occurrences").notNull().default(1),
	lastObserved: timestamp("last_observed", { withTimezone: true }).notNull(),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
