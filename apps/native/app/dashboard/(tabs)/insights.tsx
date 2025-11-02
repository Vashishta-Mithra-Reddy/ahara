import { View, Text } from "react-native";

export default function Insights() {
  return (
    <View className="flex-1 px-4 py-6 bg-background pt-20">
      <Text className="text-xl font-outfit-semibold text-foreground mb-2">
        Your Insights
      </Text>
      <Text className="text-muted-foreground">
        Patterns and trends from your food tracking
      </Text>

      <View className="mt-6 rounded-lg border border-border p-4 bg-card">
        <Text className="text-lg font-jakarta-medium text-foreground mb-2">
          Insights Coming Soon
        </Text>
        <Text className="text-muted-foreground">
          Keep logging your food to unlock personalized correlations and recommendations.
        </Text>
      </View>
    </View>
  );
}