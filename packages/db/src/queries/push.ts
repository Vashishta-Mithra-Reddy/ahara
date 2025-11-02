import { db } from "../index";
import { pushToken } from "../schema/push";
import { and, eq } from "drizzle-orm";

export const registerPushToken = async (data: {
  userId: string;
  token: string;
  platform?: string;
  deviceName?: string;
}) => {
  const existing = await db.select().from(pushToken).where(eq(pushToken.token, data.token)).limit(1);
  if (existing.length) {
    return await db
      .update(pushToken)
      .set({
        userId: data.userId,
        platform: data.platform ?? existing[0]?.platform,
        deviceName: data.deviceName ?? existing[0]?.deviceName,
        isActive: true,
        lastUsedAt: new Date(),
      })
      .where(eq(pushToken.token, data.token))
      .returning();
  }
  return await db
    .insert(pushToken)
    .values({
      userId: data.userId,
      token: data.token,
      platform: data.platform ?? "web",
      deviceName: data.deviceName,
      isActive: true,
      lastUsedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
};

export const getPushTokensByUser = async (userId: string) => {
  return await db
    .select()
    .from(pushToken)
    .where(and(eq(pushToken.userId, userId), eq(pushToken.isActive, true)));
};

export const disablePushToken = async (token: string) => {
  return await db
    .update(pushToken)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(pushToken.token, token))
    .returning();
};

export const deletePushToken = async (token: string) => {
  return await db.delete(pushToken).where(eq(pushToken.token, token)).returning();
};