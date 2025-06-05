import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StreakDisplayProps {
  streak: number;
  size?: "small" | "medium" | "large";
  iconColor?: string;
  textColor?: string;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  streak,
  size = "medium",
  iconColor = "#FFC107",
  textColor = "#666666",
}) => {
  if (streak <= 0) {
    return null;
  }

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 16;
      case "medium":
        return 20;
      case "large":
        return 24;
    }
  };

  const getTextStyle = () => {
    switch (size) {
      case "small":
        return styles.streakTextSmall;
      case "medium":
        return styles.streakTextMedium;
      case "large":
        return styles.streakTextLarge;
    }
  };

  return (
    <View style={styles.streakContainer}>
      <Ionicons name="flame-outline" size={getIconSize()} color={iconColor} />
      <Text style={[getTextStyle(), { color: textColor }]}>{streak}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakTextSmall: {
    fontSize: 14,
    fontFamily: "Gabarito-Bold",
  },
  streakTextMedium: {
    fontSize: 16,
    fontFamily: "Gabarito-Bold",
  },
  streakTextLarge: {
    fontSize: 18,
    fontFamily: "Gabarito-Bold",
  },
});
