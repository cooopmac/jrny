import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function JourneysHeader({ journeyCount = 0 }) {
  return (
    <View style={styles.header}>
      <Text style={styles.pageTitle}>journeys.</Text>
      <Text style={styles.subtitle}>{journeyCount} active</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  pageTitle: {
    fontSize: 48,
    fontFamily: "Gabarito-ExtraBold",
    color: "#000000",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Gabarito-Regular",
    fontSize: 16,
    color: "#6b7280",
  },
});
