import Ionicons from "@expo/vector-icons/Ionicons";
import { Button, Input, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log("Login attempt with:", email, password);
  };

  const navigateToSignUp = () => {
    router.push("/signup");
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
          welcome back.
        </Text>
        <Text category="s1" style={styles.subHeaderText}>
          login to your account.
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
        <Button size="giant" style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>log in</Text>
        </Button>
      </View>

      <Pressable onPress={navigateToSignUp} style={styles.signUpContainer}>
        <Text style={styles.signUpText}>
          Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text>
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
  loginButton: {
    width: "100%",
    backgroundColor: "#000000",
    borderColor: "#000000",
    borderRadius: 25,
    marginTop: 10,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontFamily: "Gabarito-SemiBold",
    fontSize: 18,
  },
  signUpContainer: {
    alignItems: "center",
    marginTop: 20,
    paddingBottom: 20,
  },
  signUpText: {
    fontFamily: "Gabarito-Regular",
    fontSize: 14,
    color: "#000000",
  },
  signUpLink: {
    fontFamily: "Gabarito-Bold",
    color: "#000000",
    textDecorationLine: "underline",
  },
});
