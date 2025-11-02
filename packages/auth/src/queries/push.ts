import { auth } from "..";
import { registerPushToken, getPushTokensByUser } from "@ahara/db";

export async function registerPushTokenForRequest(params: {
  headers: any;
  token: string;
  platform?: string;
  deviceName?: string;
}) {
  const session = await auth.api.getSession({ headers: params.headers });
  if (!session?.user) throw new Error("Unauthorized");
  return await registerPushToken({
    userId: session.user.id,
    token: params.token,
    platform: params.platform ?? "web",
    deviceName: params.deviceName,
  });
}

export async function getPushTokensByUserForServiceRequest(params: {
  headers: any;
  userId: string;
}) {
  return await getPushTokensByUser(params.userId);
}