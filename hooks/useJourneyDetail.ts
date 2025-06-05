import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import {
  deleteJourney as deleteJourneyFromService,
  fetchJourneyById,
  updateJourneyPlan,
} from "../services/journeyService";
import { Journey } from "../types";
import { getStructuredPlan } from "../utils/journeyUtils";

export const useJourneyDetail = (journeyId: string) => {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  // Load journey on mount
  useEffect(() => {
    if (journeyId) {
      loadJourney();
    }
  }, [journeyId]);

  const loadJourney = async () => {
    try {
      setLoading(true);
      const fetchedJourney = await fetchJourneyById(journeyId);
      if (fetchedJourney) {
        // Ensure aiGeneratedPlan is in the new structure
        fetchedJourney.aiGeneratedPlan = getStructuredPlan(
          fetchedJourney.aiGeneratedPlan
        );
      }
      setJourney(fetchedJourney);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Load Error",
        text2: "Failed to load journey details.",
        position: "bottom",
      });
      console.error("Failed to load journey details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStep = async (index: number) => {
    if (!journey || !journey.aiGeneratedPlan || updating) return;

    setUpdating(true);
    const originalPlan = JSON.parse(JSON.stringify(journey.aiGeneratedPlan));
    let newPlan = [...originalPlan];
    const wantsToComplete = !newPlan[index].completed;

    if (wantsToComplete) {
      // Check prerequisites
      for (let i = 0; i < index; i++) {
        if (!newPlan[i].completed) {
          Toast.show({
            type: "info",
            text1: "Prerequisite Step",
            text2: `Please complete "${newPlan[i].text}" first.`,
            position: "bottom",
          });
          setUpdating(false);
          return;
        }
      }
      newPlan[index].completed = true;
    } else {
      // Uncomplete this step and all following steps
      newPlan[index].completed = false;
      for (let i = index + 1; i < newPlan.length; i++) {
        newPlan[i].completed = false;
      }
    }

    // Calculate progress
    const completedSteps = newPlan.filter((step) => step.completed).length;
    const totalSteps = newPlan.length;
    const progressPercentage =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    // Determine status
    let newLocalStatus = journey.status;
    if (journey.status === "Planned" && completedSteps > 0) {
      newLocalStatus = "Active";
    } else if (
      journey.status === "Active" &&
      completedSteps === 0 &&
      totalSteps > 0
    ) {
      newLocalStatus = "Planned";
    }

    // Update local state optimistically
    setJourney((prevJourney) => {
      if (!prevJourney) return null;
      return {
        ...prevJourney,
        aiGeneratedPlan: newPlan,
        progress: progressPercentage,
        status: newLocalStatus,
      };
    });

    try {
      await updateJourneyPlan(journeyId, newPlan);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Failed to update step status. Please try again.",
        position: "bottom",
      });
      // Revert to original state
      setJourney({ ...journey, aiGeneratedPlan: originalPlan });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteJourney = async () => {
    Alert.alert(
      "Delete Journey",
      "Are you sure you want to delete this journey? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteJourneyFromService(journeyId);
              Toast.show({
                type: "success",
                text1: "Journey Deleted",
                text2: "The journey has been successfully deleted.",
                position: "bottom",
              });
              router.replace("/(tabs)/journeys");
            } catch (error) {
              console.error("Failed to delete journey:", error);
              Toast.show({
                type: "error",
                text1: "Delete Failed",
                text2: "Could not delete the journey. Please try again.",
                position: "bottom",
              });
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return {
    journey,
    loading,
    updating,
    handleToggleStep,
    handleDeleteJourney,
    refetch: loadJourney,
  };
};
