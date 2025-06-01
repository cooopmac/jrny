import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchJourneyById, Journey } from "../../services/journeyService"; // Corrected path

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
      {journey.aiPlan && journey.aiPlan.length > 0 ? (
        <View style={styles.aiPlanContainer}>
          <Text style={styles.aiPlanTitle}>AI-Generated Plan:</Text>
          {journey.aiPlan.map((step, index) => (
            <Text key={index} style={styles.aiPlanStep}>
              - {step}
            </Text>
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
    marginBottom: 5,
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
});

export default JourneyDetailScreen;
