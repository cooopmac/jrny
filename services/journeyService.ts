import { getAuth } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { Alert } from "react-native";

// Define Journey type/interface (consider moving to a shared types file if used elsewhere)
export interface Journey {
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
  aiPlan?: string[]; // For storing AI-generated plan steps
}

export const fetchJourneys = (
  onSuccess: (journeys: Journey[]) => void,
  onError: (error: Error) => void
) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    onError(new Error("User not authenticated."));
    return () => {}; // Return an empty unsubscribe function
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
        onSuccess(fetchedJourneys);
      },
      (error) => {
        console.error("Error fetching journeys: ", error);
        Alert.alert("Error", "Could not fetch journeys.");
        onError(error);
      }
    );

  return unsubscribe; // Return the unsubscribe function for cleanup
};

export const fetchJourneyById = async (
  journeyId: string
): Promise<Journey | null> => {
  try {
    const doc = await firestore().collection("journeys").doc(journeyId).get();
    if (Boolean(doc.exists)) {
      return { id: doc.id, ...doc.data() } as Journey;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching journey by ID: ", error);
    Alert.alert("Error", "Could not fetch journey details.");
    throw error;
  }
};

export const deleteJourney = async (journeyId: string): Promise<void> => {
  console.log(`[journeyService] Deleting journey with ID: ${journeyId}`);
  try {
    await firestore().collection("journeys").doc(journeyId).delete();
    console.log(
      `[journeyService] Journey ${journeyId} deleted successfully from Firestore.`
    );
    // Consider if any local cache or state needs to be updated upon deletion,
    // though typically the listener in fetchJourneys would handle UI updates.
  } catch (error: any) {
    console.error(
      `[journeyService] Error deleting journey ${journeyId}:`,
      error
    );
    Alert.alert("Error", `Could not delete journey. ${error.message}`);
    throw error; // Re-throw the error to be caught by the caller if needed
  }
};
