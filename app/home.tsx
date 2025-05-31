import Ionicons from "@expo/vector-icons/Ionicons"; // For FAB icon
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import {
  Button,
  Card,
  Layout,
  List,
  ListItem,
  Text,
} from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleProp, StyleSheet, TextStyle, View } from "react-native";

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

const mockCompletedGoals = [
  { id: "4", title: 'Read "Atomic Habits"' },
  { id: "5", title: "Setup Development Environment" },
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
      <Text category="h6" style={styles.goalCardTitle}>
        {item.title}
      </Text>
      {item.description && (
        <Text style={styles.goalCardDescription} category="p2">
          {item.description}
        </Text>
      )}
    </Card>
  );

  const renderCompletedGoalItem = ({
    item,
  }: {
    item: { id: string; title: string };
  }) => (
    <ListItem
      title={(props: any) => (
        <Text {...props} style={[styles.completedGoalText, props?.style]}>
          {item.title}
        </Text>
      )}
      accessoryLeft={(props: any) => (
        <Ionicons
          name="checkmark-circle-outline"
          size={24}
          color="#4CAF50"
          style={props?.style as StyleProp<TextStyle>}
        />
      )}
      style={styles.completedGoalItem}
      onPress={() => console.log("View completed goal:", item.id)}
    />
  );

  const ListHeader = () => (
    <View style={styles.listHeaderFooterContainer}>
      <View style={styles.topHeaderContainer}>
        <Text style={styles.headerTitle}>{getDate()}</Text>
        {loginStreak > 0 && (
          <View style={styles.streakContainer}>
            <Ionicons name="flame-outline" size={20} color="#FFC107" />
            <Text style={styles.streakText}>{loginStreak}</Text>
          </View>
        )}
      </View>

      <Card style={styles.focusCard}>
        <View>
          <Text style={styles.focusCardText}>complete your goals.</Text>
          <Text style={styles.focusCardText2}>
            {mockActiveGoals.length > 0
              ? `keep up the great work!`
              : "you got this!"}
          </Text>
        </View>
      </Card>

      <Text category="h5" style={styles.sectionTitle}>
        Active Goals
      </Text>
      {mockActiveGoals.length > 0 ? (
        mockActiveGoals.map((goal) => renderGoalItem({ item: goal }))
      ) : (
        <Text style={styles.emptyStateText}>
          No active goals yet. Tap the '+' to add one!
        </Text>
      )}

      <Text category="h5" style={[styles.sectionTitle, { marginTop: 30 }]}>
        Completed Goals
      </Text>
      {mockCompletedGoals.length === 0 && (
        <Text style={styles.emptyStateText}>No goals completed yet.</Text>
      )}
    </View>
  );

  return (
    <Layout style={styles.container}>
      <List
        data={mockCompletedGoals}
        renderItem={renderCompletedGoalItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={<View style={styles.listHeaderFooterContainer} />}
        style={styles.mainList}
        contentContainerStyle={
          mockCompletedGoals.length === 0 ? {} : styles.listContentContainer
        }
      />
      <Button
        style={styles.fab}
        accessoryLeft={
          <Ionicons name="add-outline" size={32} color="#FFFFFF" />
        }
        onPress={() => router.push("/")}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc", // Light background
  },
  mainList: {
    flex: 1,
    backgroundColor: "transparent",
  },
  listHeaderFooterContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listContentContainer: {
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  topHeaderContainer: {
    // New style for flexing date and streak
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10, // Same as headerTitle's original marginBottom
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
    borderRadius: 12,
    marginBottom: 30,
    padding: 40, // Increased padding for better look
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
  sectionTitle: {
    fontFamily: "Gabarito-Bold",
    marginBottom: 15,
    color: "#222b45",
  },
  goalCard: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#FFFFFF", // White cards for goals
    borderColor: "#e4e9f2",
  },
  goalCardTitle: {
    fontFamily: "Gabarito-SemiBold",
    color: "#222b45",
  },
  goalCardDescription: {
    fontFamily: "Gabarito-Regular",
    color: "#555",
    marginTop: 4,
  },
  emptyStateText: {
    fontFamily: "Gabarito-Regular",
    color: "#888",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  fab: {
    position: "absolute",
    margin: 20,
    right: 0,
    bottom: 0,
    backgroundColor: "#1a1a1a", // Dark FAB
    borderRadius: 30, // Circular
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
});
