import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { authClient } from "@/lib/auth-client";

const baseURL = process.env.EXPO_PUBLIC_SERVER_URL;

export default function Reflection() {
  const [overallFeeling, setOverallFeeling] = useState("5");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const cookie = authClient.getCookie();
      const res = await fetch(`${baseURL}/api/daily-reflections`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie || "" },
        credentials: "omit",
        body: JSON.stringify({ overallFeeling: Number(overallFeeling), notes }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMessage("Reflection saved");
      setOverallFeeling("5");
      setNotes("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 px-4 py-6">
      <Text className="text-xl font-bold mb-2">Daily Reflection</Text>
      <TextInput
        value={overallFeeling}
        onChangeText={setOverallFeeling}
        placeholder="Overall feeling (1-10)"
        keyboardType="numeric"
        className="border border-foreground/20 rounded px-3 py-2 mb-2"
      />
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes (optional)"
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