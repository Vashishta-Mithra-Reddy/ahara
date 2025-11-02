import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import {
	DarkTheme,
	DefaultTheme,
	type Theme,
	ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PostHogProvider } from "posthog-react-native";
import {
	useFonts as useOutfit,
	Outfit_400Regular,
	Outfit_500Medium,
	Outfit_600SemiBold,
	Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import {
	useFonts as useJakarta,
	PlusJakartaSans_400Regular,
	PlusJakartaSans_500Medium,
	PlusJakartaSans_600SemiBold,
	PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";

import "../global.css";
import { useColorScheme } from "@/lib/use-color-scheme";
import { NAV_THEME } from "@/lib/constants";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";

const LIGHT_THEME: Theme = {
	...DefaultTheme,
	colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
	...DarkTheme,
	colors: NAV_THEME.dark,
};

export const unstable_settings = {
	initialRouteName: "index",
};

// Prevent auto hide — we’ll hide manually once everything is ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const hasMounted = useRef(false);
	const { colorScheme, isDarkColorScheme } = useColorScheme();
	const [appReady, setAppReady] = useState(false);

	// Load Google Fonts
	const [fontsLoadedOutfit] = useOutfit({
		"Outfit-Regular": Outfit_400Regular,
		"Outfit-Medium": Outfit_500Medium,
		"Outfit-SemiBold": Outfit_600SemiBold,
		"Outfit-Bold": Outfit_700Bold,
	});
	const [fontsLoadedJakarta] = useJakarta({
		"Jakarta-Regular": PlusJakartaSans_400Regular,
		"Jakarta-Medium": PlusJakartaSans_500Medium,
		"Jakarta-SemiBold": PlusJakartaSans_600SemiBold,
		"Jakarta-Bold": PlusJakartaSans_700Bold,
	});

	const fontsLoaded = fontsLoadedOutfit && fontsLoadedJakarta;

	
	useIsomorphicLayoutEffect(() => {
		if (hasMounted.current) return;

		if (Platform.OS === "web") {
			document.documentElement.classList.add("bg-background");
		}

		setAndroidNavigationBar(colorScheme);
		hasMounted.current = true;
	}, [colorScheme]);

	// Once fonts & theme are ready, hide splash
	useEffect(() => {
		if (fontsLoaded) {
			const hideSplash = async () => {
				await SplashScreen.hideAsync();
				setAppReady(true);
			};
			hideSplash();
		}
	}, [fontsLoaded]);

	if (!appReady) {
		return null;
	}

	return (
		<PostHogProvider
			apiKey="phc_4eRHTvxUA27AP5t9WOqtLR68jn9xvWygzXC3uzxk8t"
			options={{ host: "https://us.i.posthog.com" }}
		>
			<ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
				<StatusBar style={isDarkColorScheme ? "light" : "dark"} />
				<GestureHandlerRootView style={{ flex: 1 }}>
					<Stack>
						{/* Landing */}
						<Stack.Screen name="index" options={{ headerShown: false }} />
						{/* Auth (combined) */}
						<Stack.Screen name="auth/index" options={{ title: "Account", headerShown: false }} />
						{/* Onboarding */}
						<Stack.Screen name="onboarding/index" options={{ title: "Onboarding", headerShown: false }} />
						{/* Dashboard tabs */}
						<Stack.Screen name="dashboard/(tabs)" options={{ headerShown: false }} />
						{/* Modal retained */}
						<Stack.Screen
							name="modal"
							options={{ title: "Modal", presentation: "modal" }}
						/>
					</Stack>
				</GestureHandlerRootView>
			</ThemeProvider>
		</PostHogProvider>
	);
}

const useIsomorphicLayoutEffect =
	Platform.OS === "web" && typeof window === "undefined"
		? React.useEffect
		: React.useLayoutEffect;
