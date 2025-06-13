import { JourneyDisplay } from "@/types/journey";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import JourneyCard from "./journey-card";

export default function JourneysList({
  journeys,
  onJourneyPress,
  isLoading,
}: {
  journeys: JourneyDisplay[];
  onJourneyPress: (journey: JourneyDisplay) => void;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {journeys.map((journey) => (
        <JourneyCard
          key={journey.id}
          journey={journey}
          onPress={onJourneyPress}
        />
      ))}

      {/* Bottom spacing for navigation */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bottomSpacing: {
    height: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
