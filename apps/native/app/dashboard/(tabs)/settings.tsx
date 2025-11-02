import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authClient } from "@/lib/auth-client";
import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';

type ReminderSettingsRecord = {
  id?: string;
  dailyLogReminder: boolean;
  symptomCheckReminder: boolean;
  logReminderTime?: string;
  symptomCheckTime?: string;
  timezone?: string;
};

const baseURL = process.env.EXPO_PUBLIC_SERVER_URL;

export default function Settings() {
  const [settings, setSettings] = useState<ReminderSettingsRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signOut = useCallback(() => {
    authClient.signOut();
    router.replace("/");
    handleCleanUp();
  }, []);

  async function handleCleanUp() {
    await SecureStore.deleteItemAsync('onboardingStatus');
  }

  const fetchSettings = useCallback(async () => {
    if (!baseURL) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const cookie = authClient.getCookie();
      const res = await fetch(`${baseURL}/api/reminder-settings`, {
        headers: { Cookie: cookie || "" },
        credentials: "omit",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const record = Array.isArray(data) ? data[0] ?? null : data ?? null;
      setSettings(
        record || {
          dailyLogReminder: false,
          symptomCheckReminder: false,
          logReminderTime: "09:00",
          symptomCheckTime: "21:00",
          timezone: "UTC",
        },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSettings();
    setRefreshing(false);
  }, [fetchSettings]);

  const save = useCallback(async () => {
    if (!baseURL || !settings) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const cookie = authClient.getCookie();
      const res = await fetch(`${baseURL}/api/reminder-settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie || "",
        },
        credentials: "omit",
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMessage("Settings updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }, [settings]);

  if (loading && !settings) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 px-4 py-6 bg-background pt-20"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text className="text-xl font-outfit-semibold text-foreground mb-2">
        Settings
      </Text>
      <Text className="text-muted-foreground mb-4">
        Control daily logging and symptom check reminders
      </Text>

      {error && (
        <Text className="text-destructive mb-4">Error: {error}</Text>
      )}
      {message && (
        <Text className="text-primary mb-4">{message}</Text>
      )}

      <View className="rounded-lg border border-border p-4 bg-card mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="font-jakarta-medium text-foreground">Daily Log Reminder</Text>
            <Text className="text-xs text-muted-foreground">
              Remind me to log food daily
            </Text>
          </View>
          <Switch
            value={!!settings?.dailyLogReminder}
            onValueChange={(val) =>
              setSettings((prev) => prev ? { ...prev, dailyLogReminder: !!val } : prev)
            }
          />
        </View>
        <View>
          <Text className="text-xs text-muted-foreground mb-1">Time (HH:MM)</Text>
          <TextInput
            value={settings?.logReminderTime || ""}
            onChangeText={(text) =>
              setSettings((prev) => prev ? { ...prev, logReminderTime: text } : prev)
            }
            placeholder="e.g., 09:00"
            className="border border-input rounded px-3 py-2"
          />
        </View>
      </View>

      <View className="rounded-lg border border-border p-4 bg-card mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="font-jakarta-medium text-foreground">Symptom Check Reminder</Text>
            <Text className="text-xs text-muted-foreground">
              Remind me to check symptoms
            </Text>
          </View>
          <Switch
            value={!!settings?.symptomCheckReminder}
            onValueChange={(val) =>
              setSettings((prev) => prev ? { ...prev, symptomCheckReminder: !!val } : prev)
            }
          />
        </View>
        <View>
          <Text className="text-xs text-muted-foreground mb-1">Time (HH:MM)</Text>
          <TextInput
            value={settings?.symptomCheckTime || ""}
            onChangeText={(text) =>
              setSettings((prev) => prev ? { ...prev, symptomCheckTime: text } : prev)
            }
            placeholder="e.g., 21:00"
            className="border border-input rounded px-3 py-2"
          />
        </View>
      </View>

      <View className="rounded-lg border border-border p-4 bg-card mb-6">
        <Text className="text-xs text-muted-foreground mb-1">Timezone</Text>
        <TextInput
          value={settings?.timezone || ""}
          onChangeText={(text) =>
            setSettings((prev) => prev ? { ...prev, timezone: text } : prev)
          }
          placeholder="e.g., America/Los_Angeles"
          className="border border-input rounded px-3 py-2"
        />
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={save}
          disabled={saving || !settings}
          className="px-4 py-3 rounded bg-primary"
        >
          <Text className="text-primary-foreground font-jakarta-medium">
            {saving ? "Saving..." : "Save Settings"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={fetchSettings}
          disabled={loading}
          className="px-4 py-3 rounded border border-primary"
        >
          <Text className="text-primary font-jakarta-medium">Refresh</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={signOut}
        className="py-3.5 mt-8 rounded-xl bg-destructive items-center justify-center"
      >
        <Text className="text-destructive-foreground font-jakarta-semibold text-xl">Sign Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}