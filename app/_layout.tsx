import * as eva from "@eva-design/eva";
import { ApplicationProvider } from "@ui-kitten/components";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // Load fonts
        await Font.loadAsync({
          "Gabarito-SemiBold": require("../assets/fonts/Gabarito-SemiBold.ttf"),
          "Gabarito-Regular": require("../assets/fonts/Gabarito-Regular.ttf"),
          "Gabarito-Medium": require("../assets/fonts/Gabarito-Medium.ttf"),
          "Gabarito-ExtraBold": require("../assets/fonts/Gabarito-ExtraBold.ttf"),
          "Gabarito-Bold": require("../assets/fonts/Gabarito-Bold.ttf"),
          "Gabarito-Black": require("../assets/fonts/Gabarito-Black.ttf"),
        });
      } catch (e) {
        // We might want to route here to an error screen
        console.warn(e);
      } finally {
        setFontsLoaded(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!fontsLoaded) {
    return null; // Render nothing until fonts are loaded
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ApplicationProvider {...eva} theme={eva.light}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="home" />
          </Stack>
        </ApplicationProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
