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
import InitializationScreen from "../components/InitializationScreen";

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
    }
  }, [fontsLoaded, authInitializing]);

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
        </ApplicationProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
