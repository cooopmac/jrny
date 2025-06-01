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
