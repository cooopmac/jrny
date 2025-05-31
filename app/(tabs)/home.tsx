import Ionicons from "@expo/vector-icons/Ionicons"; // For FAB icon
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { Card, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars"; // Import Calendar
import CircularProgress from "react-native-circular-progress-indicator";

// Key for AsyncStorage (must match the one in _layout.tsx)
const LOGIN_STREAK_COUNT_KEY = "@App:loginStreakCount";

// Mock data for goals
const mockActiveGoals = [
  {
    id: "1",
    title: "Learn TypeScript",
    description: "Master the fundamentals and advanced concepts.",
  },
  {
    id: "2",
    title: "Run a Marathon",
    description: "Complete a full 26.2-mile marathon.",
  },
  {
    id: "3",
    title: "Write a Novel",
    description: "Draft and edit a 50,000-word novel.",
  },
];

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

export default function HomeScreen() {
  const router = useRouter();
  const [loginStreak, setLoginStreak] = useState(0); // State for login streak

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

  const renderGoalItem = ({
    item,
  }: {
    item: { id: string; title: string; description?: string };
  }) => (
    <Card
      key={item.id}
      style={styles.goalCard}
      onPress={() => console.log("Navigate to goal:", item.id)}
    >
      <View style={styles.goalCardContent}>
        <CircularProgress
          value={58}
          radius={25}
          valueSuffix={"%"}
          activeStrokeWidth={5}
          inActiveStrokeWidth={5}
        />
        <View style={styles.goalTextContainer}>
          <Text style={styles.goalCardTitle}>{item.title.toLowerCase()}</Text>
          {item.description && (
            <Text style={styles.goalCardDescription}>{item.description}</Text>
          )}
        </View>
      </View>
    </Card>
  );

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
        <Card style={styles.focusCard}>
          <View>
            <Text style={styles.focusCardText}>create your goals.</Text>
            <Text style={styles.focusCardText2}>
              {mockActiveGoals.length > 0
                ? `get a full guide to complete your journey.`
                : "you got this!"}
            </Text>
            <Card style={styles.focusCardButton}>
              <Text style={styles.focusCardButtonText}>
                view your journeys.
              </Text>
            </Card>
          </View>
        </Card>

        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>active journies.</Text>
          <TouchableOpacity
            onPress={() => console.log("Add button pressed")}
            style={styles.addButton}
          >
            <Ionicons name="add-circle-outline" size={28} color="#333333" />
          </TouchableOpacity>
        </View>
        {mockActiveGoals.length > 0 ? (
          mockActiveGoals.map((goal) => renderGoalItem({ item: goal }))
        ) : (
          <Text style={styles.emptyStateText}>
            No active goals yet. Tap the '+' to add one!
          </Text>
        )}

        <Text style={[styles.sectionTitle]}>activity calendar.</Text>
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
    padding: 15,
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
    marginTop: 20,
  },
  calendarContainer: {
    borderRadius: 15,
    overflow: "hidden", // Ensures the border radius is applied to the Calendar
    marginBottom: 20,
    marginTop: 15,
  },
});
