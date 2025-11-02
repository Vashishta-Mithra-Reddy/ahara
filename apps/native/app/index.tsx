import { View, Text, TouchableOpacity } from "react-native";
import { useEffect, useCallback } from "react";
import { router } from "expo-router";
import { authClient } from "@/lib/auth-client";

const baseURL = process.env.EXPO_PUBLIC_SERVER_URL;

async function getOnboardingCompleted(): Promise<boolean> {
  if (!baseURL) return false;
  const cookie = authClient.getCookie();
  const res = await fetch(`${baseURL}/api/onboarding`, {
    headers: { Cookie: cookie || "" },
    credentials: "omit",
  });
  if (!res.ok) return false;
  const status = await res.json().catch(() => null);
  const completed = Array.isArray(status) ? status[0]?.completed === true : !!status?.completed;
  return !!completed;
}

export default function Landing() {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (isPending) return;
      if (session?.user) {
        const completed = await getOnboardingCompleted();
        if (!mounted) return;
        if (completed) {
          router.replace("/dashboard/overview");
        } else {
          router.replace("/onboarding");
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [session, isPending]);

  const goSignIn = useCallback(() => router.push("/auth?mode=signin"), []);
  const goSignUp = useCallback(() => router.push("/auth?mode=signup"), []);

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-5xl text-foreground mb-4 font-outfit-semibold">āhāra</Text>
      <Text className="text-md text-balance text-muted-foreground text-center font-jakarta">
        Track what you eat. 
      </Text>
      <Text className="text-md text-balance text-muted-foreground mb-8 text-center font-jakarta">
        Understand how you feel.
      </Text>
      <View className="flex-row gap-4">
        <TouchableOpacity onPress={goSignIn} className="px-5 py-3 flex items-center justify-center rounded-xl bg-primary">
          <Text className="text-primary-foreground font-jakarta-medium text-center">Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goSignUp} className="px-5 flex items-center justify-center py-3 rounded-xl border border-primary">
          <Text className="text-primary font-jakarta-medium text-center">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}