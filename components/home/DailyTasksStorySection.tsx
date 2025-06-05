import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Journey } from "../../types";

interface DailyTasksStorySectionProps {
  journeysForStories: Journey[];
  isStoryViewed: (journeyId: string) => boolean;
  onStoryPress: (journey: Journey) => void;
}

export const DailyTasksStorySection: React.FC<DailyTasksStorySectionProps> = ({
  journeysForStories,
  isStoryViewed,
  onStoryPress,
}) => {
  if (journeysForStories.length === 0) {
    return null;
  }

  return (
    <View style={styles.storySectionContainer}>
      <Text style={styles.storySectionTitle}>daily tasks.</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storyScrollContainer}
      >
        {journeysForStories.map((journey) => {
          const isViewed = isStoryViewed(journey.id);
          return (
            <TouchableOpacity
              key={journey.id}
              style={styles.storyItem}
              onPress={() => onStoryPress(journey)}
            >
              <View
                style={[
                  styles.storyBubble,
                  isViewed
                    ? styles.storyBubbleViewed
                    : styles.storyBubbleUnviewed,
                ]}
              >
                <Ionicons name="flash-outline" size={26} color="#FFF" />
              </View>
              <Text style={styles.storyTitleText} numberOfLines={1}>
                {journey.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  storySectionContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  storySectionTitle: {
    fontSize: 24,
    fontFamily: "Gabarito-Bold",
    color: "#333333",
    marginBottom: 10,
    marginHorizontal: 16,
  },
  storyScrollContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  storyItem: {
    alignItems: "center",
    width: 80,
  },
  storyBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFC107",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  storyBubbleViewed: {
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  storyBubbleUnviewed: {
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  storyTitleText: {
    fontSize: 12,
    fontFamily: "Gabarito-Regular",
    color: "#666666",
    textAlign: "center",
  },
});
