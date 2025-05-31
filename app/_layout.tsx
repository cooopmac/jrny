import * as eva from "@eva-design/eva";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { ApplicationProvider } from "@ui-kitten/components";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import InitializationScreen from "../components/InitializationScreen";

// Key for AsyncStorage
const LAST_LOGIN_DATE_KEY = "@App:lastLoginDate";
const LOGIN_STREAK_COUNT_KEY = "@App:loginStreakCount";

async function updateLoginStreak() {
  try {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD format

    const lastLoginDateString = await AsyncStorage.getItem(LAST_LOGIN_DATE_KEY);
    const streakCountString = await AsyncStorage.getItem(
      LOGIN_STREAK_COUNT_KEY
    );
    let currentStreak = streakCountString ? parseInt(streakCountString, 10) : 0;

    if (lastLoginDateString) {
      if (lastLoginDateString === todayString) {
        // Already logged in today, streak already counted or initiated
        console.log("Streak: Already logged in today.");
        return; // No change to streak or last login date needed if it's already today
      }

      const lastLoginDate = new Date(lastLoginDateString);
      // Calculate the difference in days
      const differenceInTime = today.getTime() - lastLoginDate.getTime();
      const differenceInDays = Math.floor(
        differenceInTime / (1000 * 3600 * 24)
      );

      if (differenceInDays === 1) {
        // Consecutive day
        currentStreak++;
        console.log("Streak: Consecutive day! New streak:", currentStreak);
      } else {
        // Gap in login, reset streak to 1 for today
        currentStreak = 1;
        console.log("Streak: Broken or first login in a while. Reset to 1.");
      }
    } else {
      // First login (for this feature) or data cleared
      currentStreak = 1;
      console.log("Streak: First login recorded. Set to 1.");
    }

    await AsyncStorage.setItem(LAST_LOGIN_DATE_KEY, todayString);
    await AsyncStorage.setItem(
      LOGIN_STREAK_COUNT_KEY,
      currentStreak.toString()
    );
  } catch (error) {
    console.error("Failed to update login streak:", error);
  }
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [authInitializing, setAuthInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    let authSubscriber: (() => void) | undefined = undefined;

    async function initializeApp() {
      // 1. Load fonts and set initialized flag
      try {
        await Font.loadAsync({
          "Gabarito-SemiBold": require("../assets/fonts/Gabarito-SemiBold.ttf"),
          "Gabarito-Regular": require("../assets/fonts/Gabarito-Regular.ttf"),
          "Gabarito-Medium": require("../assets/fonts/Gabarito-Medium.ttf"),
          "Gabarito-ExtraBold": require("../assets/fonts/Gabarito-ExtraBold.ttf"),
          "Gabarito-Bold": require("../assets/fonts/Gabarito-Bold.ttf"),
          "Gabarito-Black": require("../assets/fonts/Gabarito-Black.ttf"),
        });
        // @ts-ignore: AsyncStorage might not be fully typed
        await AsyncStorage.setItem("initialized", "true");
        setFontsLoaded(true);
      } catch (e) {
        console.warn("Error during font loading or AsyncStorage operation:", e);
        setFontsLoaded(true); // Still set to true to allow app to proceed or show error
      }

      // 2. Setup Firebase auth state listener
      const authInstance = getAuth();
      authSubscriber = onAuthStateChanged(authInstance, (firebaseUser) => {
        setUser(firebaseUser);
        if (authInitializing) {
          setAuthInitializing(false);
        }
      });
    }

    initializeApp();

    // Cleanup subscription on unmount
    return () => {
      if (authSubscriber) {
        authSubscriber();
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    if (fontsLoaded && !authInitializing) {
      SplashScreen.hideAsync();
      if (user) {
        // Only update streak if a user is logged in
        updateLoginStreak();
      }
    }
  }, [fontsLoaded, authInitializing, user]);

  if (!fontsLoaded || authInitializing) {
    return <InitializationScreen />;
  }

  // App is ready, user state is known
  // console.log("User:", user); // You can log user here for debugging

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ApplicationProvider {...eva} theme={eva.light}>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Example of conditional routing based on user */}
            {/* {user ? (
              <Stack.Screen name="home" />
            ) : (
              <Stack.Screen name="login" /> // Assuming you have a login screen
            )}
            <Stack.Screen name="index" redirect={!user} />  // or some other logic
            <Stack.Screen name="home" redirect={!user} /> */}
            <Stack.Screen name="index" />
            <Stack.Screen name="home" />
          </Stack>
          <Toast />
        </ApplicationProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
