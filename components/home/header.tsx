import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { StreakDisplay } from "./streak";

// Separate component for each animated character
const AnimatedCharacter = ({
  char,
  index,
  shouldAnimate,
}: {
  char: string;
  index: number;
  shouldAnimate: boolean;
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (shouldAnimate) {
      opacity.value = withDelay(index * 100, withTiming(1, { duration: 300 }));

      translateY.value = withDelay(
        index * 100,
        withTiming(0, { duration: 300 })
      );
    }
  }, [shouldAnimate, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[styles.character, animatedStyle]}>
      {char}
    </Animated.Text>
  );
};

export default function Header() {
  const days = [
    "sunday.",
    "monday.",
    "tuesday.",
    "wednesday.",
    "thursday.",
    "friday.",
    "saturday.",
  ];
  const today = new Date().getDay();
  const text = days[today];
  const characters = text.split("");

  return (
    <Animated.View style={styles.header}>
      <View style={styles.textContainer}>
        {characters.map((char, index) => (
          <AnimatedCharacter
            key={`${text}-${index}`} // Include text in key to reset animation on text change
            char={char}
            index={index}
            shouldAnimate={true}
          />
        ))}
      </View>
      <StreakDisplay streak={10} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 80,
    flexDirection: "row",
    backgroundColor: "white",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  textContainer: {
    flexDirection: "row",
  },
  character: {
    fontFamily: "Gabarito-ExtraBold",
    fontSize: 48,
    color: "black",
  },
});
