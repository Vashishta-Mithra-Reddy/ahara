import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelPosition: "below-icon",
        tabBarStyle: { backgroundColor: "black", height: 64, paddingTop: 4, paddingBottom: 2 },
        tabBarItemStyle: { justifyContent: "center", alignItems: "center" },
        tabBarLabelStyle: { textAlign: "center" },
      }}
    >
      <Tabs.Screen
        name="overview"
        options={{
          title: "Overview",
          headerShown: false,
          tabBarLabelStyle: { fontFamily: "Jakarta-SemiBold" },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="food-log"
        options={{
          title: "Food Log",
          headerShown: false,
          tabBarLabelStyle: { fontFamily: "Jakarta-SemiBold" },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fast-food" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="reflection"
        options={{
          title: "Reflection",
          headerShown: false,
          tabBarLabelStyle: { fontFamily: "Jakarta-SemiBold" },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="happy" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          headerShown: false,
          tabBarLabelStyle: { fontFamily: "Jakarta-SemiBold" },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarLabelStyle: { fontFamily: "Jakarta-SemiBold" },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}