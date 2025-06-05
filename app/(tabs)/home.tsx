import Ionicons from "@expo/vector-icons/Ionicons"; // For FAB icon
import {
  Button,
  Card,
  Layout,
  MenuItem,
  OverflowMenu,
  Text,
} from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Text as RNText,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native"; // Added ActivityIndicator, RNText, StyleProp, TextStyle
import { Calendar } from "react-native-calendars"; // Import Calendar
import CircularProgress from "react-native-circular-progress-indicator";
import { DailyTasksModal } from "../../components/home/DailyTasksModal";
import { DailyTasksStorySection } from "../../components/home/DailyTasksStorySection";
import { useDailyTasks } from "../../hooks/useDailyTasks";
import { useJourneys } from "../../hooks/useJourneys";
import { useLoginStreak } from "../../hooks/useLoginStreak";
import { deleteJourney as deleteJourneyFromService } from "../../services/journeyService"; // Corrected import path, Added deleteJourneyFromService
import { Journey } from "../../types";
import { getDate } from "../../utils/dateUtils";

export default function HomeScreen() {
  const router = useRouter();
  const [menuVisibleForJourney, setMenuVisibleForJourney] = useState<
    string | null
  >(null); // State for active menu

  // Use custom hooks
  const { loginStreak } = useLoginStreak();
  const {
    activeJourneys,
    journeysForStories,
    loading: loadingJourneys,
  } = useJourneys();
  const {
    selectedJourneyForModal,
    isDailyTaskModalVisible,
    openDailyTaskModal,
    closeDailyTaskModal,
    isStoryViewed,
  } = useDailyTasks(journeysForStories);

  const handleCreateNewJourney = () => {
    router.push("/create-journey");
  };

  const handleDeleteJourney = async (journeyId: string) => {
    console.log(`[home] Attempting to delete journey: ${journeyId}`);
    const journeyToDelete = activeJourneys.find((j) => j.id === journeyId);
    setMenuVisibleForJourney(null); // Close menu first
    if (journeyToDelete) {
      try {
        await deleteJourneyFromService(journeyId);
        console.log(
          `[home] Journey ${journeyId} (${journeyToDelete.title}) deletion initiated.`
        );
        // Firestore listener in fetchJourneys should update the UI.
      } catch (error) {
        console.error(
          `[home] Error initiating deletion for journey ${journeyId}:`,
          error
        );
      }
    } else {
      console.warn(
        `[home] Journey with id ${journeyId} not found for deletion.`
      );
    }
  };

  const renderGoalItem = ({
    item,
  }: {
    item: Journey; // Changed to Journey type
  }) => {
    const renderMenuAnchor = () => (
      <TouchableOpacity
        style={styles.menuAnchorButton}
        onPress={() => setMenuVisibleForJourney(item.id)}
        activeOpacity={0.6}
      >
        <Ionicons name="ellipsis-vertical" size={24} color="#333333" />
      </TouchableOpacity>
    );

    console.log(
      `[home] Rendering Journey Card: Title: "${item.title}", Description: "${
        item.description
      }" (Type: ${typeof item.description})`
    ); // Added for debugging

    const DeleteIcon = (props: any) => (
      <Ionicons name="trash-outline" size={20} color={props.style.tintColor} />
    );

    return (
      <Card key={item.id} style={styles.goalCard}>
        <View style={styles.goalCardContent}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            activeOpacity={0.7}
            onPress={() => {
              console.log("Navigate to journey:", item.id);
              router.push({
                pathname: "/journey/[id]",
                params: { id: item.id },
              });
            }}
          >
            <CircularProgress
              value={item.progress || 0} // Use journey progress, default to 0
              radius={25}
              valueSuffix={"%"}
              activeStrokeWidth={5}
              inActiveStrokeWidth={5}
            />
            <View style={styles.goalTextContainer}>
              <Text style={styles.goalCardTitle}>
                {item.title.toLowerCase()}
              </Text>
              <Text style={styles.goalCardDescription} numberOfLines={1}>
                {(() => {
                  if (item.aiGeneratedPlan && item.aiGeneratedPlan.length > 0) {
                    const firstUncompletedStep = item.aiGeneratedPlan.find(
                      (step) => !step.completed
                    );
                    if (firstUncompletedStep) {
                      return firstUncompletedStep.text;
                    }
                    // If all steps are completed, show the first step's text as a fallback for the plan
                    if (
                      item.aiGeneratedPlan[0] &&
                      item.aiGeneratedPlan[0].text
                    ) {
                      return `First step: ${item.aiGeneratedPlan[0].text}`; // Or a different message like "All steps done!"
                    }
                  }
                  return item.description || "No details or steps available.";
                })()}
              </Text>
            </View>
          </TouchableOpacity>

          <OverflowMenu
            visible={menuVisibleForJourney === item.id}
            anchor={renderMenuAnchor}
            onBackdropPress={() => setMenuVisibleForJourney(null)}
            backdropStyle={styles.overflowMenuBackdrop}
          >
            <MenuItem
              title={(props: { style?: StyleProp<TextStyle> }) => (
                <RNText style={[props.style, styles.menuItemText]}>
                  delete.
                </RNText>
              )}
              accessoryLeft={DeleteIcon}
              onPress={() => handleDeleteJourney(item.id)}
            />
          </OverflowMenu>
        </View>
      </Card>
    );
  };

  return (
    <Layout style={styles.container}>
      {/* Sticky Header Part */}
      <View style={styles.stickyHeaderContainer}>
        <Text style={styles.headerTitle}>{getDate()}</Text>
        {loginStreak > 0 && (
          <View style={styles.streakContainer}>
            <Ionicons name="flame-outline" size={20} color="#FFC107" />
            <Text style={styles.streakText}>{loginStreak}</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Tasks Story Section */}
        <DailyTasksStorySection
          journeysForStories={journeysForStories}
          isStoryViewed={isStoryViewed}
          onStoryPress={openDailyTaskModal}
        />

        <Card style={styles.focusCard}>
          <View>
            <Text style={styles.focusCardText}>create your goals.</Text>
            <Text style={styles.focusCardText2}>
              {activeJourneys.length > 0 // Use activeJourneys.length
                ? "you got this!"
                : "get a full guide to complete your journey."}
            </Text>
            <Button
              style={styles.focusCardButton}
              status="basic"
              onPress={() => router.push("/journeys")}
              activeOpacity={0.8}
            >
              <Text style={styles.focusCardButtonText}>
                view your journeys.
              </Text>
            </Button>
          </View>
        </Card>

        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>active journeys.</Text>
          <TouchableOpacity
            onPress={handleCreateNewJourney}
            style={styles.addButton}
            activeOpacity={0.6}
          >
            <Ionicons name="add-circle-outline" size={28} color="#333333" />
          </TouchableOpacity>
        </View>
        {loadingJourneys ? (
          <ActivityIndicator color="#000000" style={styles.loadingIndicator} />
        ) : activeJourneys.length > 0 ? (
          activeJourneys.map((journey: Journey) =>
            renderGoalItem({ item: journey })
          ) // Explicitly type journey here if needed, though often inferred
        ) : (
          <Text style={styles.emptyStateText}>
            no active journeys yet. tap the '+' to add one.
          </Text>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 15 }]}>
          activity calendar.
        </Text>
        <View style={styles.calendarContainer}>
          <Calendar
            current={new Date().toISOString().split("T")[0]}
            minDate={"2024-01-01"}
            maxDate={"2024-12-31"}
            onDayPress={(day) => {
              console.log("selected day", day);
            }}
            onMonthChange={(month) => {
              console.log("month changed", month);
            }}
            hideArrows={true}
            hideExtraDays={true}
            disableMonthChange={true}
            firstDay={1}
            hideDayNames={false}
            showWeekNumbers={false}
            onPressArrowLeft={(subtractMonth) => subtractMonth()}
            onPressArrowRight={(addMonth) => addMonth()}
            disableAllTouchEventsForDisabledDays={true}
            renderHeader={() => <View />}
            enableSwipeMonths={true}
            markingType={"custom"}
            markedDates={{
              [new Date().toISOString().split("T")[0]]: {
                customStyles: {
                  container: {
                    backgroundColor: "#e0f7fa", // Light cyan background
                    borderRadius: 16, // Circular shape
                  },
                  text: {
                    color: "#00796b", // Darker cyan text
                    fontWeight: "bold",
                  },
                },
              },
            }}
            theme={{
              backgroundColor: "#ffffff",
              calendarBackground: "#ffffff",
              textSectionTitleColor: "#b6c1cd",
              selectedDayBackgroundColor: "#00adf5",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#00adf5",
              dayTextColor: "#2d4150",
              textDisabledColor: "#d9e1e8",
              dotColor: "#00adf5",
              selectedDotColor: "#ffffff",
              arrowColor: "orange",
              disabledArrowColor: "#d9e1e8",
              monthTextColor: "blue",
              indicatorColor: "blue",
              textDayFontFamily: "Gabarito-Regular",
              textMonthFontFamily: "Gabarito-Bold",
              textDayHeaderFontFamily: "Gabarito-Regular",
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>
      </ScrollView>
      <DailyTasksModal
        visible={isDailyTaskModalVisible}
        journey={selectedJourneyForModal}
        onClose={closeDailyTaskModal}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f2f4",
  },
  stickyHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20, // Or your desired status bar height + padding
    paddingBottom: 10, // Padding below the sticky header content
    backgroundColor: "#f7f9fc", // Match container background or make distinct
    paddingHorizontal: 20,
  },
  mainScroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: "Gabarito-ExtraBold",
    fontSize: 48,
    color: "#000000", // Dark text
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0", // Light orange background for streak
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    shadowColor: "#FF9800",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  streakText: {
    fontFamily: "Gabarito-Bold",
    fontSize: 16,
    color: "#FF9800", // Orange color for streak text
    marginLeft: 5,
  },
  focusCard: {
    backgroundColor: "#000000", // Dark card background
    borderRadius: 25,
    marginBottom: 10,
    padding: 40, // Increased padding for better look
    alignItems: "center", // Center button if it's not full width
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  focusCardText: {
    fontFamily: "Gabarito-Bold",
    fontSize: 24,
    color: "#ffffff", // Light text
    marginBottom: 10,
    textAlign: "center",
  },
  focusCardText2: {
    fontFamily: "Gabarito-Regular",
    fontSize: 16,
    color: "#e0e0e0", // Lighter text for subtitle
    marginBottom: 30,
    textAlign: "center",
  },
  focusCardButton: {
    backgroundColor: "#ffffff", // Example button color
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: "center", // Center button
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  focusCardButtonText: {
    color: "#000000",
    fontFamily: "Gabarito-Bold",
    fontSize: 16,
    textAlign: "center",
  },
  sectionTitle: {
    fontFamily: "Gabarito-Bold",
    fontSize: 24,
    color: "#333333", // Darker text for section titles
    flex: 1, // Allow title to take available space
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  addButton: {
    marginLeft: 10, // Add some space between text and button
    padding: 8, // Make it easier to press
    borderRadius: 20,
  },
  goalCard: {
    marginBottom: 15,
    backgroundColor: "#ffffff", // White background for cards
    borderRadius: 15,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Added to push menu to the end
    padding: 10,
  },
  goalTextContainer: {
    marginLeft: 15,
    flex: 1, // Allow text to take remaining space
  },
  goalCardTitle: {
    fontFamily: "Gabarito-Medium",
    fontSize: 18,
    color: "#000000",
  },
  goalCardDescription: {
    fontFamily: "Gabarito-Regular",
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    margin: 24,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000", // FAB background color
    borderRadius: 30, // Make it circular
  },
  emptyStateText: {
    fontFamily: "Gabarito-Regular",
    fontSize: 16,
    textAlign: "center",
    color: "#777",
    marginTop: 10,
    marginBottom: 5,
  },
  calendarContainer: {
    borderRadius: 15,
    overflow: "hidden", // Ensures the border radius is applied to the Calendar
    marginBottom: 20,
    marginTop: 15,
  },
  loadingIndicator: {
    // Added style for loading indicator
    marginTop: 20,
    alignSelf: "center",
  },
  menuAnchorButton: {
    padding: 8, // Added padding for easier touch
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
  overflowMenuBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuItemText: {
    // Added new style for menu item text
    fontFamily: "Gabarito-Bold",
  },
  // Styles for Daily Tasks Story Section
  storiesOuterContainer: {
    marginTop: 10,
    marginBottom: 20, // Space below the stories section
    paddingHorizontal: 10, // Match general padding
  },
  storiesSectionTitle: {
    fontFamily: "Gabarito-Bold",
    fontSize: 24,
    color: "#333333",
    marginBottom: 12,
    // paddingHorizontal: 10, // Added padding
  },
  storiesScrollContent: {
    paddingVertical: 5,
    alignItems: "flex-start",
  },
  storyItem: {
    alignItems: "center",
    marginRight: 15,
    width: 70, // Fixed width for story item
  },
  storyBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    // borderWidth and borderColor will be applied by specific unviewed/viewed styles
  },
  storyBubbleUnviewed: {
    borderWidth: 3,
    borderColor: "magenta", // Bright color for unviewed stories
  },
  storyBubbleViewed: {
    borderWidth: 2,
    borderColor: "#B0B0B0", // Subtle border for viewed stories
  },
  storyTitleText: {
    fontFamily: "Gabarito-Regular",
    fontSize: 12,
    color: "#333333",
    textAlign: "center",
  },

  // Styles for Daily Tasks Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: "Gabarito-Bold",
    fontSize: 20,
    marginBottom: 20,
    color: "#333333",
    textAlign: "center",
  },
  modalTaskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTaskIcon: {
    marginRight: 15,
  },
  modalTaskText: {
    fontFamily: "Gabarito-Regular",
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
  modalCloseButton: {
    marginTop: 25,
    borderColor: "#000000",
    backgroundColor: "#000000",
    borderRadius: 25,
  },
  modalCloseButtonText: {
    color: "#ffffff",
    fontFamily: "Gabarito-Bold",
    fontSize: 16,
  },
});
