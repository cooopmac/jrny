import Ionicons from "@expo/vector-icons/Ionicons";
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
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Your Journeys</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateNewJourney}
        >
          <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
          <Text style={styles.createButtonText}>New Journey</Text>
        </TouchableOpacity>
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
    padding: 15,
    backgroundColor: "#f1f2f4",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f2f4",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: "Gabarito-Bold",
    color: "#333",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFEFF4",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  createButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: "Gabarito-Medium",
    color: "#007AFF",
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  journeyCard: {
    marginBottom: 15,
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
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Gabarito-Regular",
    color: "#555",
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    fontFamily: "Gabarito-Light",
    color: "#777",
  },
});
