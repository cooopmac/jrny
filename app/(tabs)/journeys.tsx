import CreateJourneyButton from "@/components/journeys/create-journey";
import JourneysHeader from "@/components/journeys/header";
import JourneysList from "@/components/journeys/journeys-list";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function JourneysScreen() {
  const [journeys, setJourneys] = useState([
    {
      id: 1,
      title: "Make 10k MRR building my app",
      nextStep: "Complete user authentication system",
      progress: 23,
      category: "business",
      color: "#8b5cf6",
    },
    {
      id: 2,
      title: "Learn React Native development",
      nextStep: "Build a todo app with navigation",
      progress: 67,
      category: "learning",
      color: "#06b6d4",
    },
    {
      id: 3,
      title: "Run a half marathon",
      nextStep: "Complete 8-mile long run this weekend",
      progress: 45,
      category: "fitness",
      color: "#f59e0b",
    },
    {
      id: 4,
      title: "Read 24 books this year",
      nextStep: "Finish chapter 3 of 'Atomic Habits'",
      progress: 33,
      category: "personal",
      color: "#10b981",
    },
  ]);

  const handleJourneyPress = (journey: any) => {
    console.log("Navigate to journey details:", journey.title);
    // Here you would navigate to the detailed journey view
    // navigation.navigate('JourneyDetails', { journeyId: journey.id });
  };

  const handleCreateJourney = () => {
    console.log("Navigate to create journey");
    // Here you would navigate to the create journey flow
    // navigation.navigate('CreateJourney');
  };

  return (
    <SafeAreaView style={styles.container}>
      <JourneysHeader journeyCount={journeys.length} />
      <CreateJourneyButton onPress={handleCreateJourney} />
      <JourneysList journeys={journeys} onJourneyPress={handleJourneyPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
