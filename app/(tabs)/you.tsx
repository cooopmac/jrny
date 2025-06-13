import { supabase } from "@/utils/supabase"; // Update this path to your supabase.ts location
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function You() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get the current user's email
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Navigate to login after sign out
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to sign out");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You</Text>

      {userEmail && <Text style={styles.email}>{userEmail}</Text>}

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  signOutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
