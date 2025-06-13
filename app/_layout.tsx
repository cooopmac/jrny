import { supabase } from "@/utils/supabase"; // Update this path to your supabase.ts location
import { Session } from "@supabase/supabase-js";
import { Stack, router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(
        "Initial session check:",
        session ? "Session found" : "No session"
      );
      setSession(session);
      setIsLoading(false);

      // Only navigate if we're not already on the home page
      if (session && pathname === "/") {
        router.replace("/home");
      }
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(
          "Auth state changed:",
          event,
          session ? "Session exists" : "No session"
        );
        setSession(session);

        // Handle navigation based on auth state
        if (event === "SIGNED_IN" && pathname === "/") {
          router.replace("/home");
        } else if (event === "SIGNED_OUT") {
          router.replace("/");
        }
      }
    );

    return () => {
      console.log("Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, [pathname]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Protected guard={session !== null}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
