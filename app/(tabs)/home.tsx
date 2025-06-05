import Ionicons from "@expo/vector-icons/Ionicons"; // For FAB icon
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import {
  Button,
  Card,
  Layout,
  MenuItem,
  OverflowMenu,
  Text,
} from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
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
import {
  deleteJourney as deleteJourneyFromService,
  fetchJourneys,
  Journey,
} from "../../services/journeyService"; // Corrected import path, Added deleteJourneyFromService

// Key for AsyncStorage (must match the one in _layout.tsx)
const LOGIN_STREAK_COUNT_KEY = "@App:loginStreakCount";
const VIEWED_STORIES_DATES_KEY = "@App:viewedStoriesDates"; // Key for viewed story dates

const getDate = () => {
  const days = [
    "sunday.",
    "monday.",
    "tuesday.",
    "wednesday.",
    "thursday.",
    "friday.",
    "saturday.",
  ];

  const date = new Date();
  const day = date.getDay();
  return days[day];
};

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function HomeScreen() {
  const router = useRouter();
  const [loginStreak, setLoginStreak] = useState(0); // State for login streak
  const [activeJourneys, setActiveJourneys] = useState<Journey[]>([]); // State for active journeys
  const [journeysForStories, setJourneysForStories] = useState<Journey[]>([]); // State for story bubbles
  const [isDailyTaskModalVisible, setIsDailyTaskModalVisible] = useState(false);
  const [selectedJourneyForModal, setSelectedJourneyForModal] =
    useState<Journey | null>(null);
  const [viewedStoryJourneyIds, setViewedStoryJourneyIds] = useState<string[]>(
    []
  ); // For unread story ring
  const [loadingJourneys, setLoadingJourneys] = useState(true); // State for loading journeys
  const [menuVisibleForJourney, setMenuVisibleForJourney] = useState<
    string | null
  >(null); // State for active menu

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
  }, []); // Empty dependency array: run once on mount

  // Effect to load initial viewed story statuses from AsyncStorage
  useEffect(() => {
    const loadViewedStories = async () => {
      try {
        const storedViewedDates = await AsyncStorage.getItem(
          VIEWED_STORIES_DATES_KEY
        );
        const today = getTodayDateString();
        const initiallyViewedIds: string[] = [];

        if (storedViewedDates) {
          const viewedDatesMap: { [key: string]: string } =
            JSON.parse(storedViewedDates);
          journeysForStories.forEach((journey) => {
            if (viewedDatesMap[journey.id] === today) {
              initiallyViewedIds.push(journey.id);
            }
          });
        }
        setViewedStoryJourneyIds(initiallyViewedIds);
      } catch (error) {
        console.error("Failed to load viewed stories dates:", error);
      }
    };

    if (journeysForStories.length > 0) {
      // Only run if there are stories to check
      loadViewedStories();
    }
    // Rerun if journeysForStories changes, to correctly initialize based on available stories
  }, [journeysForStories]);

  // Effect to fetch journeys
  useEffect(() => {
    setLoadingJourneys(true);
    const unsubscribe = fetchJourneys(
      (journeys: Journey[]) => {
        setActiveJourneys(
          journeys.filter((journey) => journey.status === "Active")
        );
        // Filter for stories: Active or Planned journeys with daily tasks
        setJourneysForStories(
          journeys.filter(
            (j) =>
              j.status === "Active" && j.dailyTasks && j.dailyTasks.length > 0
          )
        );
        setLoadingJourneys(false);
      },
      (error: Error) => {
        // Explicitly type error
        console.error("Failed to fetch journeys for home screen:", error);
        setLoadingJourneys(false);
        // Optionally, show an alert or a message to the user
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

  const DailyTasksStorySection = () => {
    if (journeysForStories.length === 0 || loadingJourneys) {
      return null;
    }
    return (
      <View style={styles.storiesOuterContainer}>
        <Text style={styles.storiesSectionTitle}>Daily Focus</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesScrollContent}
        >
          {journeysForStories.map((journey) => {
            const isViewed = viewedStoryJourneyIds.includes(journey.id);
            return (
              <TouchableOpacity
                key={journey.id}
                style={styles.storyItem}
                onPress={async () => {
                  // Make onPress async
                  setSelectedJourneyForModal(journey);
                  setIsDailyTaskModalVisible(true);
                  if (!isViewed) {
                    setViewedStoryJourneyIds((prev) => [...prev, journey.id]);
                    // Persist this view for today
                    try {
                      const today = getTodayDateString();
                      const storedViewedDates = await AsyncStorage.getItem(
                        VIEWED_STORIES_DATES_KEY
                      );
                      const viewedDatesMap = storedViewedDates
                        ? JSON.parse(storedViewedDates)
                        : {};
                      viewedDatesMap[journey.id] = today;
                      await AsyncStorage.setItem(
                        VIEWED_STORIES_DATES_KEY,
                        JSON.stringify(viewedDatesMap)
                      );
                    } catch (error) {
                      console.error("Failed to save viewed story date:", error);
                    }
                  }
                }}
              >
                <View
                  style={[
                    styles.storyBubble, // Base style
                    isViewed
                      ? styles.storyBubbleViewed
                      : styles.storyBubbleUnviewed, // Conditional border
                  ]}
                >
                  <Ionicons name="flash-outline" size={26} color="#FFF" />
                </View>
                <Text style={styles.storyTitleText} numberOfLines={1}>
                  {journey.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const DailyTasksModal = () => {
    if (!selectedJourneyForModal) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDailyTaskModalVisible}
        onRequestClose={() => setIsDailyTaskModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Daily Tasks for: {selectedJourneyForModal.title}
            </Text>
            {selectedJourneyForModal.dailyTasks?.length ? (
              selectedJourneyForModal.dailyTasks.map(
                (
                  task: string,
                  index: number // Added types for task and index
                ) => (
                  <View key={index} style={styles.modalTaskItem}>
                    <Ionicons
                      name="ellipse-outline"
                      size={18}
                      color="#007AFF"
                      style={styles.modalTaskIcon}
                    />
                    <Text style={styles.modalTaskText}>{task}</Text>
                  </View>
                )
              )
            ) : (
              <Text style={styles.modalTaskText}>
                No daily tasks specified for this journey.
              </Text>
            )}
            <Button
              onPress={() => setIsDailyTaskModalVisible(false)}
              style={styles.modalCloseButton}
              appearance="ghost"
            >
              Close
            </Button>
          </View>
        </View>
      </Modal>
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
      >
        {/* Daily Tasks Story Section */}
        <DailyTasksStorySection />

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
          >
            <Ionicons name="add-circle-outline" size={28} color="#333333" />
          </TouchableOpacity>
        </View>
        {loadingJourneys ? (
          <ActivityIndicator color="#007AFF" style={styles.loadingIndicator} />
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
      <DailyTasksModal />
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
    paddingVertical: 5,
    paddingHorizontal: 20,
    alignSelf: "center", // Center button
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
    padding: 5, // Make it easier to press
  },
  goalCard: {
    marginBottom: 15,
    backgroundColor: "#ffffff", // White background for cards
    borderRadius: 15,
    borderColor: "#ffffff",
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
  },
  menuAnchorButton: {
    padding: 8, // Added padding for easier touch
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
    color: "#333",
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
    color: "#444",
    flex: 1,
  },
  modalCloseButton: {
    marginTop: 25,
  },
});
