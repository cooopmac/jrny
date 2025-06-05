import { getAuth } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import { fetchJourneys } from "../services/journeyService";
import { Journey } from "../types";

export const useJourneys = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [activeJourneys, setActiveJourneys] = useState<Journey[]>([]);
  const [journeysForStories, setJourneysForStories] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState(getAuth().currentUser);

  useEffect(() => {
    const auth = getAuth();

    // Listen to auth state changes
    const authUnsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => {
      authUnsubscribe();
    };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isSubscribed = true; // Flag to prevent setting state after unmount or auth change

    if (!user) {
      // If no user, don't fetch. Clear existing journeys and set loading to false.
      setJourneys([]);
      setActiveJourneys([]);
      setJourneysForStories([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Wrap fetchJourneys in try-catch to handle immediate errors
    try {
      unsubscribe = fetchJourneys(
        (fetchedJourneys: Journey[]) => {
          // Only update state if component is still mounted and user is still authenticated
          if (isSubscribed && user) {
            setJourneys(fetchedJourneys);

            // Filter active journeys
            setActiveJourneys(
              fetchedJourneys.filter((journey) => journey.status === "Active")
            );

            // Filter for stories: Active journeys with daily tasks
            setJourneysForStories(
              fetchedJourneys.filter(
                (j) =>
                  j.status === "Active" &&
                  j.dailyTasks &&
                  j.dailyTasks.length > 0
              )
            );

            setLoading(false);
          }
        },
        (error: Error) => {
          // Only handle error if component is still mounted and user is authenticated
          if (isSubscribed && user) {
            console.error("Failed to fetch journeys:", error);
            setError(error);
            setLoading(false);
          } else if (isSubscribed && !user) {
            // User signed out, this is expected - clear data without error
            console.log("User signed out, clearing journeys data");
            setJourneys([]);
            setActiveJourneys([]);
            setJourneysForStories([]);
            setLoading(false);
            setError(null);
          }
        }
      );
    } catch (error) {
      if (isSubscribed) {
        console.error("Error setting up journey listener:", error);
        setError(error as Error);
        setLoading(false);
      }
    }

    return () => {
      isSubscribed = false; // Mark as unsubscribed
      if (unsubscribe) {
        // Immediately unsubscribe when user changes
        unsubscribe();
      }
    };
  }, [user]);

  return {
    journeys,
    activeJourneys,
    journeysForStories,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
    },
  };
};
