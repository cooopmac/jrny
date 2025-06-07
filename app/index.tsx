import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { router } from "expo-router";

export default function LoadingScreen() {
  useEffect(() => {
    // Navigate to tabs after 2 seconds
    const timer = setTimeout(() => {
      router.replace("/(tabs)/home");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.loadingText}>jrny.</Text>
        <ActivityIndicator
          size="large"
          color="#000000"
          style={styles.spinner}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Gabarito-ExtraBold",
    fontSize: 32,
    color: "black",
  },
  spinner: {
    marginTop: 10,
  },
});
