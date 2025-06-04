import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { getAuth } from "@react-native-firebase/auth"; // Removed
// import firestore from "@react-native-firebase/firestore"; // Removed
import { Card, Layout } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, // Keep Alert for potential local errors
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CircularProgress from "react-native-circular-progress-indicator"; // Added
import { fetchJourneys, Journey } from "../../services/journeyService"; // Import the service

// Key for AsyncStorage (must match the one in _layout.tsx and home.tsx)
const LOGIN_STREAK_COUNT_KEY = "@App:loginStreakCount";

export default function JourneysScreen() {
  const router = useRouter();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginStreak, setLoginStreak] = useState(0);

  // Effect for fetching login streak
  useEffect(() => {
    const fetchLoginStreak = async () => {
      try {
        const streakCountString = await AsyncStorage.getItem(
          LOGIN_STREAK_COUNT_KEY
        );
        if (streakCountString) {
          setLoginStreak(parseInt(streakCountString, 10));
        }
      } catch (error) {
        console.error("Failed to fetch login streak for display:", error);
      }
    };
    fetchLoginStreak();
  }, []);

  useEffect(() => {
    setLoading(true); // Ensure loading is true at the start of fetch
    const unsubscribe = fetchJourneys(
      (fetchedJourneys) => {
        setJourneys(fetchedJourneys);
        setLoading(false);
      },
      (error) => {
        // Alert.alert("Error", "Could not fetch journeys."); // Alert is already handled in service
        console.error("Error in JourneysScreen: ", error.message); // Log specific error message
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleCreateNewJourney = () => {
    router.push("/create-journey");
  };

  const renderJourneyItem = ({ item }: { item: Journey }) => (
    <Card
      style={styles.journeyCard}
      onPress={() => {
        console.log("View Journey:", item.id);
        router.push({
          pathname: "/journey/[id]",
          params: { id: item.id },
        });
      }}
    >
      <View style={styles.journeyCardContent}>
        <CircularProgress
          value={item.progress || 0}
          radius={25}
          valueSuffix={"%"}
          activeStrokeWidth={5}
          inActiveStrokeWidth={5}
          inActiveStrokeColor={"#E0E0E0"}
        />
        <View style={styles.journeyTextContainer}>
          <View style={styles.journeyCardHeader}>
            <Text style={styles.journeyTitle}>{item.title}</Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  item.status === "Active" && styles.statusDotActive,
                  item.status === "Planned" && styles.statusDotPlanned,
                  item.status === "Completed" && styles.statusDotCompleted,
                ]}
              />
              <Text style={styles.journeyStatus}>{item.status}</Text>
            </View>
          </View>
          {item.description && (
            <Text style={styles.journeyDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          {item.aiGeneratedPlan &&
            item.aiGeneratedPlan.length > 0 &&
            (() => {
              const firstUncompletedStep = item.aiGeneratedPlan?.find(
                (step) => !step.completed
              );
              const nextStepText = firstUncompletedStep
                ? firstUncompletedStep.text
                : item.aiGeneratedPlan && item.aiGeneratedPlan[0]
                ? item.aiGeneratedPlan[0].text
                : "No steps"; // Fallback to first step if all completed, then to generic message
              const subText = firstUncompletedStep
                ? "Next Step:"
                : item.aiGeneratedPlan && item.aiGeneratedPlan[0]
                ? "First Step:"
                : "Plan:";

              if (!item.aiGeneratedPlan || item.aiGeneratedPlan.length === 0)
                return null;

              return (
                <View style={styles.nextStepContainer}>
                  <Text style={styles.nextStepLabel}>{subText}</Text>
                  <Text style={styles.nextStepText} numberOfLines={1}>
                    {nextStepText}
                  </Text>
                </View>
              );
            })()}
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <Layout style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </Layout>
    );
  }

  return (
    <Layout style={styles.container}>
      <View style={styles.stickyHeaderContainer}>
        <Text style={styles.headerTitle}>your journeys.</Text>
        <View style={styles.headerRightItemsContainer}>
          {loginStreak > 0 && (
            <View style={styles.streakContainer}>
              <Ionicons name="flame-outline" size={20} color="#FFC107" />
              <Text style={styles.streakText}>{loginStreak}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateNewJourney}
          >
            <Ionicons name="add-circle-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {journeys.length > 0 ? (
        <FlatList
          data={journeys}
          renderItem={renderJourneyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>no journeys started yet.</Text>
          <Text style={styles.emptySubText}>tap "new journey" to begin.</Text>
        </View>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f2f4",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f2f4",
  },
  stickyHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#f7f9fc",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontFamily: "Gabarito-ExtraBold",
    fontSize: 36,
    color: "#000000",
  },
  headerRightItemsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  streakText: {
    fontFamily: "Gabarito-Bold",
    fontSize: 16,
    color: "#FF9800",
    marginLeft: 5,
  },
  createButton: {
    padding: 5,
  },
  listContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  journeyCard: {
    marginBottom: 15,
    borderRadius: 25,
    borderColor: "#ffffff",
    borderWidth: 1,
    backgroundColor: "#ffffff",
  },
  journeyCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  journeyTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  journeyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  journeyTitle: {
    fontSize: 18,
    fontFamily: "Gabarito-Medium",
    flexShrink: 1,
    marginRight: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: "green",
  },
  statusDotPlanned: {
    backgroundColor: "yellow",
  },
  statusDotCompleted: {
    backgroundColor: "grey",
  },
  journeyStatus: {
    fontSize: 14,
    fontFamily: "Gabarito-Regular",
    color: "#8E8E93",
    marginLeft: 8,
  },
  journeyDescription: {
    fontSize: 14,
    fontFamily: "Gabarito-Regular",
    color: "#555555",
    marginTop: 3,
    marginBottom: 5,
  },
  nextStepContainer: {
    marginTop: 5,
    backgroundColor: "#f0f0f0",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  nextStepLabel: {
    fontSize: 12,
    fontFamily: "Gabarito-Bold",
    color: "#333333",
    marginBottom: 2,
  },
  nextStepText: {
    fontSize: 13,
    fontFamily: "Gabarito-Regular",
    color: "#444444",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Gabarito-ExtraBold",
    color: "#555",
    marginBottom: 5,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: "Gabarito-Regular",
    color: "#777",
    textAlign: "center",
  },
});
