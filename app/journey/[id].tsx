import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  fetchJourneyById,
  Journey,
  updateJourneyPlan,
} from "../../services/journeyService"; // Corrected path

// Helper to handle old and new plan structures
const getStructuredPlan = (plan: any) => {
  if (!plan || plan.length === 0) return [];
  if (typeof plan[0] === "string") {
    // Old format: string[], convert to new format
    return plan.map((stepText: string) => ({
      text: stepText,
      completed: false,
    }));
  }
  // Already new format or unhandled: return as is (or add more robust checks)
  return plan;
};

const JourneyDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && typeof id === "string") {
      const loadJourney = async () => {
        try {
          setLoading(true);
          const fetchedJourney = await fetchJourneyById(id);
          if (fetchedJourney) {
            // Ensure aiGeneratedPlan is in the new structure
            fetchedJourney.aiGeneratedPlan = getStructuredPlan(
              fetchedJourney.aiGeneratedPlan
            );
          }
          setJourney(fetchedJourney);
        } catch (error) {
          Alert.alert("Error", "Failed to load journey details.");
        } finally {
          setLoading(false);
        }
      };
      loadJourney();
    }
  }, [id]);

  const handleToggleStep = async (index: number) => {
    if (!journey || !journey.aiGeneratedPlan) return;

    const originalPlan = JSON.parse(JSON.stringify(journey.aiGeneratedPlan)); // Deep copy for potential revert
    let newPlan = [...originalPlan];
    const wantsToComplete = !newPlan[index].completed;

    if (wantsToComplete) {
      // Check if all previous steps are completed
      for (let i = 0; i < index; i++) {
        if (!newPlan[i].completed) {
          Alert.alert(
            "Prerequisite Step",
            `Please complete "${newPlan[i].text}" before this step.`
          );
          return; // Prevent completion
        }
      }
      newPlan[index].completed = true;
    } else {
      // Wants to uncheck a step
      newPlan[index].completed = false;
      // Also uncheck all subsequent steps
      for (let i = index + 1; i < newPlan.length; i++) {
        newPlan[i].completed = false;
      }
    }

    // Optimistically update local state
    setJourney({ ...journey, aiGeneratedPlan: newPlan });

    try {
      if (typeof id === "string") {
        await updateJourneyPlan(id, newPlan);
      } else {
        throw new Error("Journey ID not found for update.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update step status. Please try again.");
      // Revert optimistic update to original plan before this toggle attempt
      setJourney({ ...journey, aiGeneratedPlan: originalPlan });
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    );
  }

  if (!journey) {
    return <Text style={styles.errorText}>Journey not found.</Text>;
  }

  return (
    <View style={styles.container}>
      <Button title="Back" onPress={() => router.back()} />
      <Text style={styles.title}>Journey Details</Text>
      <Text>ID: {journey.id}</Text>
      <Text>Title: {journey.title}</Text>
      <Text>Status: {journey.status}</Text>
      {journey.progress !== undefined && (
        <Text>Progress: {journey.progress}%</Text>
      )}
      {journey.lengthOfTime && (
        <Text>Length of Time: {journey.lengthOfTime}</Text>
      )}
      {journey.priority && <Text>Priority: {journey.priority}</Text>}
      {journey.createdAt && (
        <Text>
          Created At:{" "}
          {new Date(journey.createdAt.seconds * 1000).toLocaleDateString()}
        </Text>
      )}
      {journey.updatedAt && (
        <Text>
          Updated At:{" "}
          {new Date(journey.updatedAt.seconds * 1000).toLocaleDateString()}
        </Text>
      )}
      {journey.endDate && (
        <Text>
          End Date:{" "}
          {new Date(journey.endDate.seconds * 1000).toLocaleDateString()}
        </Text>
      )}

      {/* Display AI Generated Plan */}
      {journey.aiGeneratedPlan && journey.aiGeneratedPlan.length > 0 ? (
        <View style={styles.aiPlanContainer}>
          <Text style={styles.aiPlanTitle}>AI-Generated Plan (Checklist):</Text>
          {journey.aiGeneratedPlan.map((step, index) => (
            <TouchableOpacity
              key={index}
              style={styles.checklistItem}
              onPress={() => handleToggleStep(index)}
            >
              <Ionicons
                name={step.completed ? "checkbox-outline" : "square-outline"}
                size={24}
                color={step.completed ? "green" : "#555"}
                style={styles.checkboxIcon}
              />
              <Text
                style={[
                  styles.aiPlanStepText,
                  step.completed && styles.completedStepText,
                ]}
              >
                {step.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.noPlanText}>
          No AI-generated plan available for this journey.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  aiPlanContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#e8f5e9",
    borderRadius: 5,
  },
  aiPlanTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  aiPlanStep: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 3,
  },
  noPlanText: {
    marginTop: 20,
    fontStyle: "italic",
    textAlign: "center",
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  checkboxIcon: {
    marginRight: 10,
  },
  aiPlanStepText: {
    fontSize: 15,
    flex: 1,
    color: "#333",
  },
  completedStepText: {
    textDecorationLine: "line-through",
    color: "#aaa",
  },
});

export default JourneyDetailScreen;
