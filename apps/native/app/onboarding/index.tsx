import { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import * as SecureStore from 'expo-secure-store';

type TrackingItem = { id: string; name: string; category: string; description?: string; isDefault?: boolean };
const baseURL = process.env.EXPO_PUBLIC_SERVER_URL;

async function fetchDefaultTrackingItems(): Promise<TrackingItem[]> {
  const cookie = authClient.getCookie();
  const res = await fetch(`${baseURL}/api/tracking-items?default=true`, {
    headers: { Cookie: cookie || "" },
    credentials: "omit",
  });
  if (!res.ok) return [];
  return await res.json().catch(() => []);
}

async function saveSelectionsAndComplete(selected: Set<string>) {
  const cookie = authClient.getCookie();
  // Create selections for each selected default item
  for (const itemId of selected) {
    await fetch(`${baseURL}/api/user-selections`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie || "" },
      credentials: "omit",
      body: JSON.stringify({ trackingItemId: itemId, active: true, customAdded: false }),
    }).catch(() => null);
  }
  // Mark onboarding complete
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const res = await fetch(`${baseURL}/api/onboarding`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie || "" },
    credentials: "omit",
    body: JSON.stringify({
      completed: true,
      completedAt: new Date().toISOString(),
      timezone: tz,
    }),
  });
  if (res.ok) {
    const onboardingData = {
      completed: true,
      completedAt: new Date().toISOString(),
      timezone: tz,
    };

    await SecureStore.setItemAsync('onboardingStatus', JSON.stringify(onboardingData));

    console.log("Onboarding data securely saved");
  }

}

export default function OnboardingPage() {
  const { data: session } = authClient.useSession();
  const [items, setItems] = useState<TrackingItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const defaults = await fetchDefaultTrackingItems();
      if (!mounted) return;
      setItems(defaults);
      // Pre-select common defaults like web
      const preSelected = defaults
        .filter((i) => ["Mood", "Energy", "Sleep"].includes(i.name))
        .map((i) => i.id);
      setSelected(new Set(preSelected));
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const complete = useCallback(async () => {
    if (!session?.user) return;
    setSaving(true);
    try {
      await saveSelectionsAndComplete(selected);
      router.replace("/dashboard/(tabs)/overview");
    } catch {
      // silent fail; show minimal feedback
    } finally {
      setSaving(false);
    }
  }, [selected, session]);

  if (loading) {
    return <View className="flex-1 items-center justify-center"><ActivityIndicator /></View>;
  }

  return (
    <ScrollView className="flex-1 px-4 py-6">
      <Text className="text-2xl font-bold mb-4">Select What You’ll Track</Text>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => toggle(item.id)}
          className={`px-4 py-3 rounded mb-2 border ${selected.has(item.id) ? "bg-primary/10 border-primary" : "border-foreground/20"}`}
        >
          <Text className="text-lg">{item.name}</Text>
          <Text className="text-xs text-muted-foreground">{item.category}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={complete} disabled={saving} className="mt-4 px-4 py-3 rounded bg-primary">
        <Text className="text-primary-foreground font-semibold">{saving ? "Saving..." : "Continue to Dashboard"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}