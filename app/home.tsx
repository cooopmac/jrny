import Ionicons from "@expo/vector-icons/Ionicons"; // For FAB icon
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { Card, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
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
              <Text style={styles.focusCardButtonText}>view your journies</Text>
            </Card>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>active journies.</Text>
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
            // Initially visible month. Default = Date()
            current={new Date().toISOString().split("T")[0]}
            // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
            minDate={"2024-01-01"}
            // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
            maxDate={"2024-12-31"}
            // Handler which gets executed on day press. Default = undefined
            onDayPress={(day) => {
              console.log("selected day", day);
            }}
            // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
            monthFormat={"yyyy"}
            // Handler which gets executed when visible month changes in calendar. Default = undefined
            onMonthChange={(month) => {
              console.log("month changed", month);
            }}
            // Hide month navigation arrows. Default = false
            hideArrows={true}
            // Replace default arrows with custom ones (direction can be 'left' or 'right')
            // renderArrow={(direction) => (<Arrow/>)}
            // Do not show days of other months in month page. Default = false
            hideExtraDays={true}
            // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
            // day from another month that is visible in calendar page. Default = false
            disableMonthChange={true}
            // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
            firstDay={1}
            // Hide day names. Default = false
            hideDayNames={false}
            // Show week numbers to the left. Default = false
            showWeekNumbers={false}
            // Handler which gets executed when press arrow icon left. It receive a callback can go back month
            onPressArrowLeft={(subtractMonth) => subtractMonth()}
            // Handler which gets executed when press arrow icon right. It receive a callback can go next month
            onPressArrowRight={(addMonth) => addMonth()}
            // Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates
            disableAllTouchEventsForDisabledDays={true}
            // Replace default month and year title with custom one. the function receive a date as parameter.
            renderHeader={() => <View />}
            // Enable the option to swipe between months. Default = false
            enableSwipeMonths={true}
            // Marking types: 'dot', 'multi-dot', 'period', 'multi-period', 'custom'
            markingType={"custom"}
            markedDates={{
              // Example: Mark today and a few other days
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
    marginBottom: 20,
    padding: 40, // Increased padding for better look
    alignItems: "center", // Center button if it's not full width
  },
  focusCardText: {
    color: "#ffffff", // White text on dark card
    fontFamily: "Gabarito-ExtraBold",
    fontSize: 32,
    textAlign: "center",
  },
  focusCardText2: {
    color: "#ffffff", // White text on dark card
    fontFamily: "Gabarito-Regular",
    textAlign: "center",
    paddingTop: 10,
  },
  focusCardButton: {
    backgroundColor: "#ffffff",
    borderRadius: 25,
    marginTop: 30,
    borderColor: "#ffffff",
  },
  focusCardButtonText: {
    fontFamily: "Gabarito-Bold",
    color: "#000000",
    textAlign: "center",
  },
  sectionTitle: {
    fontFamily: "Gabarito-Bold",
    marginBottom: 15,
    fontSize: 24,
    color: "#222b45",
    marginTop: 20, // Added marginTop for spacing
  },
  goalCard: {
    marginBottom: 15,
    borderRadius: 25,
    backgroundColor: "#FFFFFF", // White cards for goals
    borderColor: "white",
  },
  goalCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalTextContainer: {
    marginLeft: 15,
    flex: 1, // Allow text to take remaining space
  },
  goalCardTitle: {
    fontFamily: "Gabarito-ExtraBold",
    color: "#000000",
    fontSize: 18,
  },
  goalCardDescription: {
    fontFamily: "Gabarito-Regular",
    color: "#555",
    marginTop: 4,
    fontSize: 14,
  },
  emptyStateText: {
    fontFamily: "Gabarito-Regular",
    color: "#888",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  completedGoalItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 8,
    borderColor: "#e4e9f2",
    borderWidth: 1,
  },
  completedGoalText: {
    fontFamily: "Gabarito-Regular",
    color: "#333",
  },
  calendarContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
  },
});
