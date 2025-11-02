import { View, Text } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { SignIn } from "@/components/sign-in";

const baseURL = process.env.EXPO_PUBLIC_SERVER_URL;

async function getOnboardingCompleted(): Promise<boolean> {
  const cookie = authClient.getCookie();
  const res = await fetch(`${baseURL}/api/onboarding`, {
    headers: { Cookie: cookie || "" },
    credentials: "omit",
  }).catch(() => null);
  if (!res?.ok) return false;
  const status = await res.json().catch(() => null);
  const completed = Array.isArray(status) ? status[0]?.completed === true : !!status?.completed;
  return !!completed;
}

export default function LoginPage() {
  useEffect(() => {
    router.replace("/auth?mode=signin");
  }, []);
  return null;
}