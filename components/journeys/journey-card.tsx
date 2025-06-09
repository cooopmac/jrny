import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function JourneyCard({
  journey,
  onPress,
}: {
  journey: any;
  onPress: (journey: any) => void;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    scale.value = withSpring(0.98, { damping: 15 }, () => {
      scale.value = withSpring(1);
    });
    opacity.value = withTiming(0.8, { duration: 100 }, () => {
      opacity.value = withTiming(1, { duration: 100 });
    });
    onPress(journey);
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.journeyCard, animatedStyle]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.journeyContent}>
        <View style={styles.journeyInfo}>
          <Text style={styles.journeyTitle}>{journey.title}</Text>
          <Text style={styles.nextStep}>{journey.nextStep}</Text>
        </View>

        <View style={styles.progressSection}>
          <View
            style={[styles.categoryDot, { backgroundColor: journey.color }]}
          />
          <Text style={styles.progressText}>{journey.progress}%</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${journey.progress}%`,
              backgroundColor: journey.color,
            },
          ]}
        />
      </View>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  journeyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  journeyContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  journeyInfo: {
    flex: 1,
    marginRight: 12,
  },
  journeyTitle: {
    fontSize: 18,
    fontFamily: "Gabarito-ExtraBold",
    color: "#000000",
    marginBottom: 4,
  },
  nextStep: {
    fontSize: 14,
    fontFamily: "Gabarito-Regular",
    color: "#6b7280",
  },
  progressSection: {
    alignItems: "flex-end",
  },
  categoryDot: {
    marginTop: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 16,
    fontFamily: "Gabarito-Bold",
    color: "#000000",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
});
