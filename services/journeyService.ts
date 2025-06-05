import { getAuth } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { Alert } from "react-native";
import { Journey } from "../types";

export const fetchJourneys = (
  onSuccess: (journeys: Journey[]) => void,
  onError: (error: Error) => void
) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.log("No user authenticated, skipping journey fetch");
    onError(new Error("User not authenticated."));
    return () => {}; // Return an empty unsubscribe function
  }

  const unsubscribe = firestore()
    .collection("journeys")
    .where("userId", "==", user.uid)
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (querySnapshot) => {
        // Check if user is still authenticated before processing
        const currentUser = getAuth().currentUser;
        if (!currentUser) {
          console.log("User signed out during journey fetch, ignoring data");
          return;
        }

        const fetchedJourneys: Journey[] = [];
        querySnapshot.forEach((doc) => {
          fetchedJourneys.push({ id: doc.id, ...doc.data() } as Journey);
        });
        onSuccess(fetchedJourneys);
      },
      (error: any) => {
        // Check if this is a permission error due to sign out
        if (error.code === "firestore/permission-denied") {
          console.log(
            "Permission denied - user likely signed out, ignoring error"
          );
          return;
        }

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

export const updateJourneyPlan = async (
  journeyId: string,
  newPlan: Array<{ text: string; completed: boolean }>
): Promise<void> => {
  try {
    // Fetch the current journey to check its status
    const journeyDoc = await firestore()
      .collection("journeys")
      .doc(journeyId)
      .get();
    if (!journeyDoc.exists) {
      throw new Error("Journey not found during plan update.");
    }
    const currentJourneyData = journeyDoc.data() as Journey;

    // Calculate progress
    const completedSteps = newPlan.filter((step) => step.completed).length;
    const totalSteps = newPlan.length;
    const progress =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    const updates: Partial<Journey> & { updatedAt: any } = {
      aiGeneratedPlan: newPlan,
      progress: progress,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    console.log(`[journeyService] updateJourneyPlan for ${journeyId}:`);
    console.log(`  Current Firestore Status: ${currentJourneyData.status}`);
    console.log(`  Calculated completedSteps: ${completedSteps}`);
    console.log(`  Calculated totalSteps: ${totalSteps}`);
    console.log(`  Calculated progress: ${progress}%`);

    // Status transition logic
    if (currentJourneyData.status === "Planned" && completedSteps > 0) {
      updates.status = "Active";
      console.log(
        `  [journeyService] Condition MET: Planned to Active. Updating status for ${journeyId} to Active.`
      );
    } else if (
      currentJourneyData.status === "Active" &&
      completedSteps === 0 &&
      totalSteps > 0
    ) {
      updates.status = "Planned";
      console.log(
        `  [journeyService] Condition MET: Active to Planned. Updating status for ${journeyId} to Planned.`
      );
    } else {
      console.log(
        `  [journeyService] Conditions for status change NOT MET. Current status ('${currentJourneyData.status}') will be maintained unless already part of 'updates' object.`
      );
    }

    if (updates.status) {
      console.log(
        `  [journeyService] Final decision: Setting status to ${updates.status}`
      );
    } else {
      console.log(
        `  [journeyService] Final decision: Status will not be changed in this update.`
      );
    }

    await firestore().collection("journeys").doc(journeyId).update(updates);
    console.log(
      `[journeyService] Journey plan for ${journeyId} updated successfully.`
    );
  } catch (error: any) {
    console.error(
      `[journeyService] Error updating journey plan for ${journeyId}:`,
      error
    );
    Alert.alert("Error", `Could not update journey plan. ${error.message}`);
    throw error;
  }
};
