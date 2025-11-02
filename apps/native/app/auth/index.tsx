import { View, Text, TouchableOpacity } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import * as SecureStore from 'expo-secure-store';

const baseURL = process.env.EXPO_PUBLIC_SERVER_URL;

async function getOnboardingCompleted(): Promise<boolean> {
  const onboardingStatus = await SecureStore.getItemAsync('onboardingStatus').catch(() => null);
  if (onboardingStatus) {
      const data = JSON.parse(onboardingStatus);
      return data.completed === true;    
  }

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

export default function AuthPage() {
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const initialMode = useMemo(() => (modeParam === "signup" ? "signup" : "signin"), [modeParam]);
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (isPending) return;
      if (session?.user) {
        const completed = await getOnboardingCompleted();
        if (!mounted) return;
        router.replace(completed ? "/dashboard/(tabs)/overview" : "/onboarding");
      }
    })();
    return () => { mounted = false; };
  }, [session, isPending]);

  return (
    <View className="flex-1 px-4 py-6 pt-20 bg-background">
      <Text className="text-2xl mb-8 font-outfit-semibold text-center text-foreground">
        {mode === "signin" ? "Sign In" : "Create Account"}
      </Text>

      <View className="flex-row mb-4 rounded-md border border-border overflow-hidden">
        <TouchableOpacity
          className={`flex-1 items-center py-2 ${mode === "signin" ? "bg-primary" : "bg-secondary"}`}
          onPress={() => setMode("signin")}
        >
          <Text className={`${mode === "signin" ? "text-primary-foreground" : "text-secondary-foreground"} font-jakarta-medium`}>
            Sign In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 items-center py-2 ${mode === "signup" ? "bg-primary" : "bg-secondary"}`}
          onPress={() => setMode("signup")}
        >
          <Text className={`${mode === "signup" ? "text-primary-foreground" : "text-secondary-foreground"} font-jakarta-medium`}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      {mode === "signin" ? <SignIn /> : <SignUp />}
    </View>
  );
}