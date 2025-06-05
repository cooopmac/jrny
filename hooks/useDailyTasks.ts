import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "../constants/storage";
import { Journey } from "../types";
import { getTodayDateString } from "../utils/dateUtils";
import { getViewedStoriesDates, setStorageObject } from "../utils/storageUtils";

export const useDailyTasks = (journeysForStories: Journey[]) => {
  const [viewedStoryJourneyIds, setViewedStoryJourneyIds] = useState<string[]>(
    []
  );
  const [selectedJourneyForModal, setSelectedJourneyForModal] =
    useState<Journey | null>(null);
  const [isDailyTaskModalVisible, setIsDailyTaskModalVisible] = useState(false);

  // Load initial viewed story statuses from AsyncStorage
  useEffect(() => {
    const loadViewedStories = async () => {
      try {
        const viewedDatesMap = await getViewedStoriesDates();
        const today = getTodayDateString();
        const initiallyViewedIds: string[] = [];

        if (viewedDatesMap) {
          journeysForStories.forEach((journey) => {
            if (viewedDatesMap[journey.id] === today) {
              initiallyViewedIds.push(journey.id);
            }
          });
        }
        setViewedStoryJourneyIds(initiallyViewedIds);
      } catch (error) {
        console.error("Failed to load viewed stories dates:", error);
      }
    };

    if (journeysForStories.length > 0) {
      loadViewedStories();
    }
  }, [journeysForStories]);

  const markStoryAsViewed = async (journeyId: string) => {
    // Update local state
    setViewedStoryJourneyIds((prev) => [...prev, journeyId]);

    // Persist this view for today
    try {
      const today = getTodayDateString();
      const viewedDatesMap = (await getViewedStoriesDates()) || {};
      viewedDatesMap[journeyId] = today;
      await setStorageObject(STORAGE_KEYS.VIEWED_STORIES_DATES, viewedDatesMap);
    } catch (error) {
      console.error("Failed to save viewed story date:", error);
    }
  };

  const openDailyTaskModal = async (journey: Journey) => {
    setSelectedJourneyForModal(journey);
    setIsDailyTaskModalVisible(true);

    // Mark as viewed if not already viewed
    const isViewed = viewedStoryJourneyIds.includes(journey.id);
    if (!isViewed) {
      await markStoryAsViewed(journey.id);
    }
  };

  const closeDailyTaskModal = () => {
    setIsDailyTaskModalVisible(false);
    setSelectedJourneyForModal(null);
  };

  const isStoryViewed = (journeyId: string) => {
    return viewedStoryJourneyIds.includes(journeyId);
  };

  return {
    viewedStoryJourneyIds,
    selectedJourneyForModal,
    isDailyTaskModalVisible,
    openDailyTaskModal,
    closeDailyTaskModal,
    markStoryAsViewed,
    isStoryViewed,
  };
};
