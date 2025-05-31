import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { Card, Layout } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Key for AsyncStorage (must match the one in _layout.tsx and home.tsx)
const LOGIN_STREAK_COUNT_KEY = "@App:loginStreakCount";

// Define Journey type/interface
interface Journey {
  id: string; // Firestore document ID
  title: string;
  status: "Planned" | "Active" | "Completed";
  progress?: number;
  userId: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  lengthOfTime?: string;
  priority?: "Low" | "Medium" | "High";
  endDate?: any; // Firestore Timestamp or Date object
}

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
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection("journeys")
      .where("userId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (querySnapshot) => {
          const fetchedJourneys: Journey[] = [];
          querySnapshot.forEach((doc) => {
            fetchedJourneys.push({ id: doc.id, ...doc.data() } as Journey);
          });
          setJourneys(fetchedJourneys);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching journeys: ", error);
          Alert.alert("Error", "Could not fetch journeys.");
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const handleCreateNewJourney = () => {
    router.push("/create-journey");
  };

  const renderJourneyItem = ({ item }: { item: Journey }) => (
    <Card
      style={styles.journeyCard}
      onPress={() => {
        console.log("View Journey:", item.id);
      }}
    >
      <View style={styles.journeyCardHeader}>
        <Text style={styles.journeyTitle}>{item.title}</Text>
        <Text style={styles.journeyStatus}>{item.status}</Text>
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
          <Text style={styles.emptyText}>No journeys started yet.</Text>
          <Text style={styles.emptySubText}>Tap "New Journey" to begin!</Text>
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
  },
  journeyStatus: {
    fontSize: 14,
    fontFamily: "Gabarito-Regular",
    color: "#8E8E93",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Gabarito-Regular",
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 16,
    fontFamily: "Gabarito-Light",
    color: "#777",
    textAlign: "center",
  },
});
