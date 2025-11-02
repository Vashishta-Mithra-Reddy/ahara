import 'dotenv/config';
import { db } from "./index";
import { trackingItem } from "./schema/food-diary";

const defaultTrackingItems = [
	{
		name: "Mood",
		category: "metric" as const,
		description: "Overall emotional state and well-being",
		isDefault: true,
	},
	{
		name: "Energy",
		category: "metric" as const,
		description: "Physical and mental energy levels",
		isDefault: true,
	},
	{
		name: "Sleep Quality",
		category: "metric" as const,
		description: "How well you slept and feeling rested",
		isDefault: true,
	},
	{
		name: "Stress Level",
		category: "metric" as const,
		description: "Overall stress and anxiety levels",
		isDefault: true,
	},
	{
		name: "Focus",
		category: "metric" as const,
		description: "Ability to concentrate and stay focused",
		isDefault: true,
	},
	{
		name: "Headache",
		category: "symptom" as const,
		description: "Head pain or discomfort",
		isDefault: true,
	},
	{
		name: "Digestive Issues",
		category: "symptom" as const,
		description: "Stomach discomfort, bloating, or digestive problems",
		isDefault: true,
	},
	{
		name: "Joint Pain",
		category: "symptom" as const,
		description: "Pain or stiffness in joints",
		isDefault: true,
	},
	{
		name: "Skin Issues",
		category: "symptom" as const,
		description: "Skin irritation, rashes, or breakouts",
		isDefault: true,
	},
	{
		name: "Fatigue",
		category: "symptom" as const,
		description: "Unusual tiredness or lack of energy",
		isDefault: true,
	},
];

export async function seedTrackingItems() {
	try {
		console.log("Seeding default tracking items...");
		
		for (const item of defaultTrackingItems) {
			await db.insert(trackingItem).values(item).onConflictDoNothing();
		}
		
		console.log("Default tracking items seeded successfully!");
	} catch (error) {
		console.error("Error seeding tracking items:", error);
		throw error;
	}
}

// Run if called directly
if (require.main === module) {
	seedTrackingItems()
		.then(() => process.exit(0))
		.catch((error) => {
			console.error(error);
			process.exit(1);
		});
}