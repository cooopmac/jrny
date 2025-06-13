import { Journey } from "@/types/journey";
import { supabase } from "@/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = [
  { id: "business", label: "Business", color: "#8b5cf6" },
  { id: "learning", label: "Learning", color: "#06b6d4" },
  { id: "fitness", label: "Fitness", color: "#f59e0b" },
  { id: "personal", label: "Personal", color: "#10b981" },
] as const;

const STATUS_COLORS = {
  Planned: "#f59e0b", // Yellow
  Active: "#10b981", // Green
  Completed: "#ef4444", // Red
} as const;

export default function JourneyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJourneyDetails();
  }, [id]);

  const fetchJourneyDetails = async () => {
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
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setJourney(data);
    } catch (error: any) {
      console.error("Error fetching journey details:", error);
      Alert.alert("Error", error.message || "Failed to fetch journey details");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  if (!journey) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Journey not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const category = CATEGORIES.find((cat) => cat.id === journey.category);
  const statusColor =
    STATUS_COLORS[journey.status as keyof typeof STATUS_COLORS] || "#6b7280";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{journey.title}</Text>
            <View style={styles.metadataRow}>
              <View style={styles.statusContainer}>
                <View
                  style={[styles.statusDot, { backgroundColor: statusColor }]}
                />
                <Text style={styles.status}>{journey.status}</Text>
              </View>
              <Text
                style={[styles.category, { backgroundColor: journey.color }]}
              >
                {category?.label || journey.category}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{journey.description}</Text>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.sectionTitle}>Progress</Text>
              <Text style={styles.progressText}>{journey.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${journey.progress}%`,
                    backgroundColor: journey.color,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Priority</Text>
                <Text style={styles.detailValue}>{journey.priority}</Text>
              </View>
              {journey.length_of_time && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Length</Text>
                  <Text style={styles.detailValue}>
                    {journey.length_of_time}
                  </Text>
                </View>
              )}
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Created</Text>
                <Text style={styles.detailValue}>
                  {formatDate(journey.created_at)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Last Updated</Text>
                <Text style={styles.detailValue}>
                  {formatDate(journey.updated_at)}
                </Text>
              </View>
            </View>
          </View>

          {journey.daily_tasks && journey.daily_tasks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Tasks</Text>
              {journey.daily_tasks.map((task, index) => (
                <View key={index} style={styles.taskItem}>
                  <Text style={styles.taskText}>{task}</Text>
                </View>
              ))}
            </View>
          )}

          {journey.ai_generated_plan && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Generated Plan</Text>
              <View style={styles.planContainer}>
                <Text style={styles.planText}>
                  {JSON.stringify(journey.ai_generated_plan, null, 2)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#374151",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Gabarito-Bold",
    color: "#000000",
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  status: {
    fontSize: 14,
    fontFamily: "Gabarito-Medium",
    color: "#4b5563",
  },
  category: {
    fontSize: 14,
    fontFamily: "Gabarito-Medium",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  description: {
    fontSize: 16,
    fontFamily: "Gabarito-Regular",
    color: "#4b5563",
    lineHeight: 24,
    marginBottom: 24,
  },
  progressSection: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Gabarito-Bold",
    color: "#000000",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontFamily: "Gabarito-Bold",
    color: "#000000",
  },
  detailsSection: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 12,
  },
  detailItem: {
    flex: 1,
    minWidth: "45%",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Gabarito-Medium",
    color: "#6b7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: "Gabarito-Regular",
    color: "#000000",
  },
  section: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  taskItem: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  taskText: {
    fontSize: 14,
    fontFamily: "Gabarito-Regular",
    color: "#000000",
  },
  planContainer: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  planText: {
    fontSize: 14,
    fontFamily: "Gabarito-Regular",
    color: "#000000",
  },
});
