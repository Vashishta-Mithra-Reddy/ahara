import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { authClient } from "@/lib/auth-client";

const baseURL = process.env.EXPO_PUBLIC_SERVER_URL;

export default function FoodLog() {
  const [name, setName] = useState("");
  const [intensity, setIntensity] = useState("5");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const cookie = authClient.getCookie();
      const res = await fetch(`${baseURL}/api/food-entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie || "" },
        credentials: "omit",
        body: JSON.stringify({
          name,
          category: "symptom",
          intensity: Number(intensity),
          loggedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMessage("Logged successfully");
      setName("");
      setIntensity("5");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to log");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 px-4 py-6">
      <Text className="text-xl font-bold mb-2">Quick Log</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Symptom name (e.g., Headache)"
        className="border border-foreground/20 rounded px-3 py-2 mb-2"
      />
      <TextInput
        value={intensity}
        onChangeText={setIntensity}
        placeholder="Intensity (1-10)"
        keyboardType="numeric"
        className="border border-foreground/20 rounded px-3 py-2 mb-2"
      />
      <TouchableOpacity onPress={submit} disabled={saving} className="px-4 py-3 rounded bg-primary">
        <Text className="text-primary-foreground font-semibold">{saving ? "Saving..." : "Save"}</Text>
      </TouchableOpacity>
      {saving && <ActivityIndicator className="mt-2" />}
      {message && <Text className="mt-2">{message}</Text>}
    </View>
  );
}