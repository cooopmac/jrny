import { Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";

export const authService = {
  signUp: async (email, password, confirmPassword) => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return {
        user: null,
        session: null,
        error: { message: "Passwords do not match" },
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Sign Up Error", error.message);
    } else if (data.session) {
      Alert.alert(
        "Success",
        "Signed up successfully! Please check your email to confirm."
      );
      router.replace("/login");
    } else if (data.user && !data.session) {
      Alert.alert(
        "Success",
        "Signed up successfully! Please check your email to confirm."
      );
      router.replace("/login");
    }
    return { user: data.user, session: data.session, error };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Login Error", error.message);
    } else if (data.session) {
      router.replace("/(tabs)/dashboard"); // Or your desired post-login route
    } else {
      Alert.alert("Login Error", "An unexpected error occurred during login.");
    }
    return { user: data.user, session: data.session, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout Error", error.message);
    } else {
      router.replace("/login");
    }
    return { error };
  },

  // You can add other auth-related functions here, like:
  // getCurrentUser: async () => { ... }
  // resetPassword: async (email) => { ... }
  // onAuthStateChange: (callback) => { ... }
};
