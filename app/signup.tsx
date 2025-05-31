import Ionicons from "@expo/vector-icons/Ionicons";
import { Button, Input, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { signUpWithEmailPassword } from "../services/authService";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match.",
      });
      return;
    }
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Email and password cannot be empty.",
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signUpWithEmailPassword(email, password);
      if (userCredential) {
        console.log("Sign up successful! User UID:", userCredential.user.uid);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Account created successfully!",
        });
        router.replace("/home");
      }
    } catch (err: any) {
      console.error("Sign up failed:", err.message);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (err.message === "email-already-in-use") {
        errorMessage = "This email address is already in use.";
      } else if (err.message === "invalid-email") {
        errorMessage = "The email address is not valid.";
      }
      Toast.show({
        type: "error",
        text1: "Sign Up Failed",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push("/login");
  };

  return (
    <Layout style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Ionicons name="arrow-back" size={12} color="#888888" />
        <Text
          style={{
            fontFamily: "Gabarito-Regular",
            fontSize: 16,
            color: "#888888",
          }}
          onPress={() => router.back()}
        >
          back
        </Text>
      </View>
      <View style={styles.headerContainer}>
        <Text category="h1" style={styles.headerText}>
          create your account.
        </Text>
        <Text category="s1" style={styles.subHeaderText}>
          start your journies with us.
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          textStyle={styles.inputText}
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          textStyle={styles.inputText}
        />
        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
          textStyle={styles.inputText}
          disabled={loading}
        />
        <Button
          size="giant"
          style={styles.signUpButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.signUpButtonText}>Signing Up...</Text>
          ) : (
            <Text style={styles.signUpButtonText}>sign up</Text>
          )}
        </Button>
      </View>

      <Pressable
        onPress={navigateToLogin}
        style={styles.loginContainer}
        disabled={loading}
      >
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLink}>Log In</Text>
        </Text>
      </Pressable>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: "#f1f2f4",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  headerText: {
    fontFamily: "Gabarito-ExtraBold",
    fontSize: 36,
    textAlign: "center",
    marginBottom: 4,
  },
  subHeaderText: {
    fontFamily: "Gabarito-Regular",
    fontSize: 16,
    textAlign: "center",
    color: "#888888",
  },
  formContainer: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    borderColor: "#000000",
    borderRadius: 10,
  },
  inputText: {
    fontFamily: "Gabarito-Regular",
    color: "#000000",
  },
  signUpButton: {
    width: "100%",
    backgroundColor: "#000000",
    borderColor: "#000000",
    borderRadius: 25,
    marginTop: 10,
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontFamily: "Gabarito-SemiBold",
    fontSize: 18,
  },
  loginContainer: {
    alignItems: "center",
    marginTop: 20,
    paddingBottom: 20,
  },
  loginText: {
    fontFamily: "Gabarito-Regular",
    fontSize: 14,
    color: "#000000",
  },
  loginLink: {
    fontFamily: "Gabarito-Bold",
    color: "#000000",
    textDecorationLine: "underline",
  },
});
