import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  withDelay,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

interface StreakDisplayProps {
  streak: number;
  size?: "small" | "medium" | "large";
  iconColor?: string;
  textColor?: string;
  shouldAnimate?: boolean;
  animationDelay?: number;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  streak,
  size = "medium",
  iconColor = "#FF9800",
  textColor = "#FF9800",
  shouldAnimate = true,
  animationDelay = 0,
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

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (shouldAnimate) {
      opacity.value = withDelay(
        animationDelay,
        withTiming(1, { duration: 300 })
      );
      scale.value = withDelay(animationDelay, withTiming(1, { duration: 300 }));
    }
  }, [shouldAnimate, animationDelay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.streakContainer, animatedStyle]}>
      <Ionicons name="flame-outline" size={getIconSize()} color={iconColor} />
      <Text style={[getTextStyle(), { color: textColor }]}>{streak}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  streakContainer: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
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
