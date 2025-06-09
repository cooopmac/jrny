import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import JourneyCard from "./journey-card";

export default function JourneysList({
  journeys,
  onJourneyPress,
}: {
  journeys: any;
  onJourneyPress: (journey: any) => void;
}) {
  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {journeys.map((journey: any) => (
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
});
