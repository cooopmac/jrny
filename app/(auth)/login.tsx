import { supabase } from "@/utils/supabase"; // Update this path if your supabase.ts is in a different location
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
}

const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const focusValue: SharedValue<number> = useSharedValue(0);
  const borderValue: SharedValue<number> = useSharedValue(0);

  const animatedInputStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      borderValue.value,
      [0, 1],
      ["#e5e7eb", "#000000"]
    );

    return {
      borderColor,
      transform: [{ scale: withSpring(focusValue.value === 1 ? 1.02 : 1) }],
    };
  });

  const handleFocus = (): void => {
    setIsFocused(true);
    focusValue.value = withSpring(1);
    borderValue.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = (): void => {
    setIsFocused(false);
    focusValue.value = withSpring(0);
    borderValue.value = withTiming(0, { duration: 200 });
  };

  return (
    <AnimatedTextInput
      style={[styles.input, animatedInputStyle]}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      value={value}
      onChangeText={onChangeText}
      onFocus={handleFocus}
      onBlur={handleBlur}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  );
};

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Animation values
  const logoOpacity: SharedValue<number> = useSharedValue(0);
  const logoTranslateY: SharedValue<number> = useSharedValue(-30);
  const formOpacity: SharedValue<number> = useSharedValue(0);
  const formTranslateY: SharedValue<number> = useSharedValue(50);
  const buttonScale: SharedValue<number> = useSharedValue(1);
  const loadingRotation: SharedValue<number> = useSharedValue(0);

  useEffect(() => {
    // Logo animation
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    logoTranslateY.value = withDelay(200, withSpring(0, { damping: 15 }));

    // Form animation
    formOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    formTranslateY.value = withDelay(600, withSpring(0, { damping: 15 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const loadingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${loadingRotation.value}deg` }],
  }));

  const validateForm = (): boolean => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleLogin = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsLoading(true);
    buttonScale.value = withSpring(0.95);

    // Start loading animation
    loadingRotation.value = withTiming(360, { duration: 1000 }, () => {
      loadingRotation.value = 0; // Reset for next rotation
    });

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Success - navigate to home
        router.replace("/home");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle specific Supabase errors
      if (error.message?.includes("Invalid login credentials")) {
        Alert.alert("Error", "Invalid email or password. Please try again.");
      } else if (error.message?.includes("Email not confirmed")) {
        Alert.alert("Error", "Please verify your email before logging in.");
      } else {
        Alert.alert(
          "Error",
          error.message || "Login failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
      buttonScale.value = withSpring(1);
    }
  };

  const handleSignupNavigation = (): void => {
    router.push("/signup");
  };

  const handleBackToLanding = (): void => {
    router.push("/");
  };

  const handleForgotPassword = async (): Promise<void> => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address first");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim()
      );

      if (error) {
        throw error;
      }

      Alert.alert(
        "Check your email",
        "We've sent you a password reset link. Please check your email."
      );
    } catch (error: any) {
      console.error("Password reset error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to send reset email. Please try again."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View style={[styles.header, logoStyle]}>
            <TouchableOpacity
              onPress={handleBackToLanding}
              style={styles.backText}
            >
              <Text style={styles.backText}>← back.</Text>
            </TouchableOpacity>
            <Text style={styles.logo}>jrny.</Text>
            <View style={styles.placeholder} />
          </Animated.View>

          {/* Welcome Section */}
          <Animated.View style={[styles.welcomeSection, logoStyle]}>
            <Text style={styles.welcomeTitle}>welcome back.</Text>
            <Text style={styles.welcomeSubtitle}>
              log in to continue your journey.
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.form, formStyle]}>
            <InputField
              placeholder="email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <InputField
              placeholder="password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>forgot password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <AnimatedTouchableOpacity
              style={[styles.loginButton, buttonStyle]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <Animated.Text style={[styles.loadingText, loadingStyle]}>
                  ⟳
                </Animated.Text>
              ) : (
                <Text style={styles.loginButtonText}>log in</Text>
              )}
            </AnimatedTouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Signup Link */}
            <TouchableOpacity
              style={styles.signupLink}
              onPress={handleSignupNavigation}
            >
              <Text style={styles.signupText}>
                don't have an account?
                <Text style={styles.signupBold}>sign up.</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    marginBottom: 40,
  },
  backText: {
    justifyContent: "center",
    alignItems: "center",
    fontSize: 20,
    paddingBottom: 0,
    fontFamily: "Gabarito-Regular",
    color: "#374151",
  },
  logo: {
    fontFamily: "Gabarito-ExtraBold",
    fontSize: 24,
    color: "black",
    paddingRight: 25,
  },
  placeholder: {
    width: 40,
  },
  welcomeSection: {
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  input: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#000000",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    minHeight: 56,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#9ca3af",
  },
  signupLink: {
    alignItems: "center",
    paddingBottom: 40,
  },
  signupText: {
    fontSize: 16,
    color: "#6b7280",
  },
  signupBold: {
    fontWeight: "600",
    color: "#111827",
  },
});
