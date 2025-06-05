import Ionicons from "@expo/vector-icons/Ionicons";
import { Card, Layout, MenuItem, OverflowMenu } from "@ui-kitten/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import { useJourneyDetail } from "../../hooks/useJourneyDetail";
import { formatFirestoreDate } from "../../utils/dateUtils";

const JourneyDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  // Use custom hook for journey management
  const { journey, loading, updating, handleToggleStep, handleDeleteJourney } =
    useJourneyDetail(typeof id === "string" ? id : "");

  const renderMenuAnchor = () => (
    <TouchableOpacity
      style={styles.menuAnchorButton}
      onPress={() => setMenuVisible(true)}
    >
      <Ionicons name="ellipsis-vertical" size={26} color="#333333" />
    </TouchableOpacity>
  );

  const DeleteIcon = (props: any) => (
    <Ionicons name="trash-outline" size={20} color={props.style.tintColor} />
  );

  if (loading) {
    return (
      <Layout style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </Layout>
    );
  }

  if (!journey) {
    return (
      <Layout style={styles.centeredMessageContainer}>
        <Text style={styles.errorText}>Journey not found.</Text>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => router.push("/(tabs)/journeys")}
        >
          <Text style={styles.backButtonErrorText}>Go Back</Text>
        </TouchableOpacity>
      </Layout>
    );
  }

  return (
    <Layout style={styles.pageContainer}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/journeys")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back-outline" size={28} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {journey.title}
        </Text>
        <View style={styles.headerRightActions}>
          <OverflowMenu
            visible={menuVisible}
            anchor={renderMenuAnchor}
            onBackdropPress={() => setMenuVisible(false)}
            backdropStyle={styles.overflowMenuBackdrop}
          >
            <MenuItem
              title={(props: { style?: StyleProp<TextStyle> }) => (
                <Text style={[props.style, styles.menuItemText]}>delete.</Text>
              )}
              accessoryLeft={DeleteIcon}
              onPress={handleDeleteJourney}
            />
          </OverflowMenu>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <Card style={styles.detailsCard}>
          <View style={styles.detailRowSpaced}>
            <View>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    journey.status === "Active" && styles.statusDotActive,
                    journey.status === "Planned" && styles.statusDotPlanned,
                    journey.status === "Completed" && styles.statusDotCompleted,
                  ]}
                />
                <Text style={styles.detailValue}>{journey.status}</Text>
              </View>
            </View>
            {journey.progress !== undefined && (
              <View style={styles.progressCircularContainer}>
                <CircularProgress
                  value={journey.progress || 0}
                  radius={35}
                  valueSuffix={"%"}
                  activeStrokeWidth={7}
                  inActiveStrokeWidth={7}
                  inActiveStrokeColor={"#E0E0E0"}
                  progressValueStyle={{
                    fontFamily: "Gabarito-Bold",
                    fontSize: 14,
                  }}
                />
              </View>
            )}
          </View>

          {journey.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.descriptionText}>{journey.description}</Text>
            </View>
          )}

          {journey.priority && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Priority:</Text>
              <Text style={styles.detailValue}>{journey.priority}</Text>
            </View>
          )}
          {journey.lengthOfTime && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>{journey.lengthOfTime}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>
              {formatFirestoreDate(journey.createdAt)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Updated:</Text>
            <Text style={styles.detailValue}>
              {formatFirestoreDate(journey.updatedAt)}
            </Text>
          </View>
          {journey.endDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ends:</Text>
              <Text style={styles.detailValue}>
                {formatFirestoreDate(journey.endDate)}
              </Text>
            </View>
          )}
        </Card>

        {/* Daily Tasks Section */}
        {journey.dailyTasks && journey.dailyTasks.length > 0 && (
          <Card style={styles.dailyTasksCard}>
            <Text style={styles.cardTitle}>Daily Tasks</Text>
            {journey.dailyTasks.map((task, index) => (
              <View key={index} style={styles.dailyTaskItem}>
                <Ionicons
                  name="flash-outline"
                  size={20}
                  color="#FFC107"
                  style={styles.dailyTaskIcon}
                />
                <Text style={styles.dailyTaskText}>{task}</Text>
              </View>
            ))}
            {/* Add a small note if needed */}
            <Text style={styles.dailyTaskFooter}>
              These are suggestions to do each day to help you reach your goal.
            </Text>
          </Card>
        )}

        {journey.aiGeneratedPlan && journey.aiGeneratedPlan.length > 0 ? (
          <Card style={styles.planCard}>
            <Text style={styles.planTitle}>Action Plan</Text>
            {journey.aiGeneratedPlan.map((step, index) => (
              <TouchableOpacity
                key={index}
                style={styles.checklistItem}
                onPress={() => handleToggleStep(index)}
              >
                <Ionicons
                  name={step.completed ? "checkbox-outline" : "square-outline"}
                  size={26}
                  color={step.completed ? "#007AFF" : "#555555"}
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
          </Card>
        ) : (
          <View style={styles.noPlanCard}>
            <Text style={styles.noPlanText}>
              No AI-generated plan available for this journey.
            </Text>
          </View>
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#f1f2f4",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f2f4",
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f1f2f4",
  },
  errorText: {
    fontSize: 20,
    fontFamily: "Gabarito-Bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 20,
  },
  backButtonError: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  backButtonErrorText: {
    color: "#ffffff",
    fontFamily: "Gabarito-Bold",
    fontSize: 16,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#f7f9fc",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: "Gabarito-ExtraBold",
    fontSize: 28,
    color: "#000000",
    textAlign: "center",
    flex: 1,
    marginHorizontal: 10,
  },
  headerRightActions: {},
  menuAnchorButton: {
    padding: 8,
  },
  overflowMenuBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuItemText: {
    fontFamily: "Gabarito-Bold",
  },
  scrollContentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  detailsCard: {
    borderRadius: 15,
    backgroundColor: "#ffffff",
    marginBottom: 20,
    padding: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailRowSpaced: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontFamily: "Gabarito-Medium",
    fontSize: 16,
    color: "#555555",
  },
  detailValue: {
    fontFamily: "Gabarito-Regular",
    fontSize: 16,
    color: "#333333",
    textAlign: "right",
  },
  descriptionContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 5,
  },
  descriptionText: {
    fontFamily: "Gabarito-Regular",
    fontSize: 15,
    color: "#333333",
    marginTop: 4,
    lineHeight: 22,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusDotActive: { backgroundColor: "green" },
  statusDotPlanned: { backgroundColor: "orange" },
  statusDotCompleted: { backgroundColor: "grey" },
  progressCircularContainer: {
    alignItems: "flex-end",
  },
  planCard: {
    borderRadius: 15,
    backgroundColor: "#ffffff",
    padding: 10,
  },
  planTitle: {
    fontFamily: "Gabarito-Bold",
    fontSize: 20,
    color: "#333333",
    marginBottom: 15,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  checkboxIcon: {
    marginRight: 12,
  },
  aiPlanStepText: {
    fontFamily: "Gabarito-Regular",
    fontSize: 16,
    flex: 1,
    color: "#333333",
  },
  completedStepText: {
    textDecorationLine: "line-through",
    color: "#999999",
    fontFamily: "Gabarito-Regular",
  },
  noPlanCard: {
    borderRadius: 15,
    backgroundColor: "#ffffff",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  noPlanText: {
    fontFamily: "Gabarito-Medium",
    fontSize: 16,
    color: "#777777",
    textAlign: "center",
  },
  dailyTasksCard: {
    marginBottom: 20,
    borderRadius: 15,
    paddingVertical: 10,
  },
  cardTitle: {
    marginBottom: 10,
    fontFamily: "Gabarito-Bold",
    fontSize: 18,
  },
  dailyTaskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dailyTaskIcon: {
    marginRight: 12,
  },
  dailyTaskText: {
    fontFamily: "Gabarito-Regular",
    fontSize: 16,
    flex: 1,
    color: "#333",
  },
  dailyTaskFooter: {
    marginTop: 10,
    fontFamily: "Gabarito-Regular",
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
});

export default JourneyDetailScreen;
