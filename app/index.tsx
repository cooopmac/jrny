import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function LandingPage() {
  const logoLetters = ["j", "r", "n", "y", "."];

  // Single animation progress value (0 to 1)
  const animationProgress = useSharedValue(0);

  // Other UI elements
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(50);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);

  useEffect(() => {
    // Animate the logo letters
    animationProgress.value = withTiming(1, { duration: 1500 }, () => {
      // Start subtitle and buttons animation
      subtitleOpacity.value = withTiming(1, { duration: 800 });
      subtitleTranslateY.value = withTiming(0, { duration: 800 });

      buttonsOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
      buttonsTranslateY.value = withDelay(
        200,
        withTiming(0, { duration: 800 })
      );
    });
  }, []);

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  const handleLogin = () => {
    console.log("Navigate to login");
    router.push("/login");
  };

  const handleSignUp = () => {
    console.log("Navigate to signup");
    router.push("/signup");
  };

  const AuthButton = ({
    title,
    onPress,
    primary = false,
  }: {
    title: string;
    onPress: () => void;
    primary: boolean;
  }) => {
    const scale = useSharedValue(1);

    const animatedButtonStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
      scale.value = withSpring(0.95, { damping: 15 }, () => {
        scale.value = withSpring(1);
      });
      onPress();
    };

    return (
      <AnimatedTouchableOpacity
        style={[
          styles.authButton,
          primary ? styles.primaryButton : styles.secondaryButton,
          animatedButtonStyle,
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Text
          style={[
            styles.buttonText,
            primary ? styles.primaryButtonText : styles.secondaryButtonText,
          ]}
        >
          {title}
        </Text>
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Animation */}
        <View style={styles.logoContainer}>
          <View style={styles.logoText}>
            {logoLetters.map((letter, index) => {
              const letterStyle = useAnimatedStyle(() => {
                const letterProgress = Math.max(
                  0,
                  Math.min(
                    1,
                    animationProgress.value * logoLetters.length - index
                  )
                );

                return {
                  opacity: withSpring(letterProgress, { damping: 15 }),
                  transform: [
                    {
                      scale: withSpring(letterProgress, { damping: 15 }),
                    },
                  ],
                };
              });

              return (
                <AnimatedText
                  key={index}
                  style={[styles.logoChar, letterStyle]}
                >
                  {letter}
                </AnimatedText>
              );
            })}
          </View>

          {/* Subtitle */}
          <AnimatedText style={[styles.subtitle, subtitleStyle]}>
            your journey to success starts here.
          </AnimatedText>
        </View>

        {/* Auth Buttons */}
        <Animated.View style={[styles.authContainer, buttonsStyle]}>
          <AuthButton title="log in" onPress={handleLogin} primary={false} />
          <AuthButton
            title="get started"
            onPress={handleSignUp}
            primary={true}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 80,
  },
  logoText: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  logoChar: {
    fontFamily: "Gabarito-ExtraBold",
    fontSize: 48,
    color: "black",
    marginHorizontal: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  authContainer: {
    width: "100%",
    gap: 10,
  },
  authButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#000000",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButtonText: {
    color: "white",
  },
  secondaryButtonText: {
    color: "#1f2937",
  },
});
