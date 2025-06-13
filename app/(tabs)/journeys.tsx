import CreateJourneyButton from "@/components/journeys/create-journey";
import JourneysHeader from "@/components/journeys/header";
import JourneysList from "@/components/journeys/journeys-list";
import { Journey, JourneyDisplay } from "@/types/journey";
import { supabase } from "@/utils/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function JourneysScreen() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJourneys = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No user found");
      }

      const { data, error } = await supabase
        .from("journeys")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setJourneys(data || []);
    } catch (error: any) {
      console.error("Error fetching journeys:", error);
      Alert.alert("Error", error.message || "Failed to fetch journeys");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchJourneys();
    }, [fetchJourneys])
  );

  const handleCreateJourney = () => {
    router.push("/create-journey");
  };

  const handleJourneyPress = (journey: JourneyDisplay) => {
    router.push({
      pathname: "/journey/[id]",
      params: { id: journey.id },
    });
  };

  const mapJourneyToDisplay = (journey: Journey): JourneyDisplay => ({
    id: journey.id,
    title: journey.title,
    description: journey.description,
    status: journey.status,
    progress: journey.progress,
    category: journey.category,
    color: journey.color,
    priority: journey.priority,
    lengthOfTime: journey.length_of_time,
    endDate: journey.end_date,
    dailyTasks: journey.daily_tasks,
    aiGeneratedPlan: journey.ai_generated_plan,
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.content}>
        {/* Fixed header and create button */}
        <View style={styles.fixedHeader}>
          <JourneysHeader />
          <CreateJourneyButton onPress={handleCreateJourney} />
        </View>

        {/* Journeys list with fade effect */}
        <View style={styles.journeysContainer}>
          <JourneysList
            journeys={journeys.map(mapJourneyToDisplay)}
            onJourneyPress={handleJourneyPress}
            isLoading={isLoading}
          />
        </View>

        {/* Gradient overlay for fade effect */}
        <LinearGradient
          colors={["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0)"]}
          style={styles.fadeOverlay}
          pointerEvents="none"
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
    position: "relative",
  },
  fixedHeader: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 10,
  },
  journeysContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  fadeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120, // Adjust this value to control how far the fade extends
    zIndex: 5,
    pointerEvents: "none",
  },
});
