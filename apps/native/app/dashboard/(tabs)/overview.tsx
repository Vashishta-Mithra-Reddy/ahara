import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { authClient } from "@/lib/auth-client";
import { ScrollView } from "react-native-gesture-handler";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

const baseURL = process.env.EXPO_PUBLIC_SERVER_URL;

interface OverviewData {
  dailyReflection: any;
  foodEntries: any[];
}

export default function Overview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { data: session } = authClient.useSession();

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const cookie = authClient.getCookie();
      if (!cookie) throw new Error("Unauthorized");

      const today = new Date().toISOString().split("T")[0];

      const [reflectionRes, foodEntriesRes] = await Promise.all([
        fetch(`${baseURL}/api/daily-reflections?date=${today}`, {
          headers: { Cookie: cookie },
        }),
        fetch(`${baseURL}/api/food-entries?date=${today}`, {
          headers: { Cookie: cookie },
        }),
      ]);

      if (!reflectionRes.ok || !foodEntriesRes.ok) {
        throw new Error(
          `HTTP Error: ${reflectionRes.status}, ${foodEntriesRes.status}`,
        );
      }

      const reflectionData = await reflectionRes.json();
      const foodEntriesData = await foodEntriesRes.json();

      setData({
        dailyReflection: reflectionData,
        foodEntries: foodEntriesData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  const renderContent = () => {
    if (error) {
      return <Text className="text-red-500 text-center mt-4">Error: {error}</Text>;
    }

    const reflectionComplete = data?.dailyReflection?.id;
    const foodEntriesCount = data?.foodEntries?.length ?? 0;

    return (
      <View className="space-y-8 gap-4">
        <OverviewCard
          title="Daily Reflection"
          value={reflectionComplete ? "Complete" : "Pending"}
          iconName={reflectionComplete ? "check-circle" : "clock"}
          onPress={() => router.push("/dashboard/reflection")}
          color={reflectionComplete ? "text-green-500" : "text-yellow-500"}
        />
        <OverviewCard
          title="Food Entries"
          value={`${foodEntriesCount} items logged`}
          iconName="book-open"
          onPress={() => router.push("/dashboard/food-log")}
          color="text-blue-500"
        />
      </View>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-background px-4 pt-20"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text className="text-2xl font-outfit-bold text-foreground mb-8 text-center">
        Welcome Back, {session?.user.name ?? "User"} !
      </Text>
      {renderContent()}
    </ScrollView>
  );
}

function OverviewCard({
  title,
  value,
  iconName,
  onPress,
  color,
  className,
}: {
  title: string;
  value: string;
  iconName: React.ComponentProps<typeof Feather>["name"];
  onPress: () => void;
  color: string;
  className?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-card p-4 rounded-lg shadow-sm flex-row items-center space-x-4 ${className}`}
    >
      <Feather name={iconName} size={24} className={color} />
      <View className="ml-4">
        <Text className="text-lg font-outfit-semibold text-card-foreground">
          {title}
        </Text>
        <Text className="text-base text-muted-foreground">{value}</Text>
      </View>
    </TouchableOpacity>
  );
}