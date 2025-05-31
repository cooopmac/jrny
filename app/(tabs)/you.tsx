import { getAuth, signOut } from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

export default function YouScreen() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(getAuth());
      // Navigation to the login/index screen is typically handled by the RootLayout
      // after the auth state changes. You could add an explicit router.replace('/') here
      // if necessary, but often the onAuthStateChanged listener in _layout.tsx handles this.
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      Alert.alert("Error", "Failed to sign out.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You Screen (Profile)</Text>
      <Button title="Sign Out" onPress={handleSignOut} color="#FF3B30" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
