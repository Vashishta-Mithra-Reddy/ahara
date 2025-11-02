import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL;

if (!serverUrl) {
  console.warn("[auth] Missing EXPO_PUBLIC_SERVER_URL");
}

export const authClient = createAuthClient({
  baseURL: serverUrl,
  plugins: [
    expoClient({
      scheme: Constants.expoConfig?.scheme as string,
      storagePrefix: Constants.expoConfig?.scheme as string,
      storage: SecureStore,
    }),
  ],
});
