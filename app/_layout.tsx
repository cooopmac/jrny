import * as eva from "@eva-design/eva";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { ApplicationProvider } from "@ui-kitten/components";
import { SplashScreen, Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import InitializationScreen from "../components/InitializationScreen";
import "../services/firebaseInitService"; // Import for Firebase initialization (side effect)
import { loadApplicationFonts } from "../services/fontService";
import { updateLoginStreak } from "../services/streakService";

// Key for AsyncStorage
const LAST_LOGIN_DATE_KEY = "@App:lastLoginDate";
const LOGIN_STREAK_COUNT_KEY = "@App:loginStreakCount";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);
  const [authInitializing, setAuthInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    let authSubscriber: (() => void) | undefined = undefined;

    async function initializeApp() {
      try {
        await loadApplicationFonts();
        setFontsLoaded(true);

        await AsyncStorage.setItem("app_initialized_flag", "true");
        setAppInitialized(true);
      } catch (e) {
        console.warn("Error during core app initialization:", e);
        setFontsLoaded(true);
        setAppInitialized(true);
      }

      const authInstance = getAuth();
      authSubscriber = onAuthStateChanged(authInstance, (firebaseUser) => {
        setUser(firebaseUser);
        if (authInitializing) {
          setAuthInitializing(false);
        }
      });
    }

    initializeApp();

    return () => {
      if (authSubscriber) {
        authSubscriber();
      }
    };
  }, []);

  useEffect(() => {
    const isAppReady = fontsLoaded && appInitialized && !authInitializing;

    if (isAppReady) {
      SplashScreen.hideAsync();
      if (user) {
        updateLoginStreak();
        router.replace("/(tabs)/home");
      } else {
        router.replace("/");
      }
    }
  }, [fontsLoaded, appInitialized, authInitializing, user, router]);

  if (!fontsLoaded || !appInitialized || authInitializing) {
    return <InitializationScreen />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ApplicationProvider {...eva} theme={eva.light}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <Toast />
        </ApplicationProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
