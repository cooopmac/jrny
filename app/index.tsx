import { Button, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function Index() {
  const router = useRouter();

  const handlePress = () => {
    router.push("/signup");
  };

  return (
    <Layout
      style={{
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
      }}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontFamily: "Gabarito-ExtraBold", fontSize: 42 }}>
          jrny.
        </Text>
      </View>
      <Button
        size="giant"
        style={{
          width: "100%",
          backgroundColor: "#000000",
          borderColor: "#000000",
          borderRadius: 25,
        }}
        onPress={handlePress}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontFamily: "Gabarito-Regular",
          }}
        >
          start your journey
        </Text>
      </Button>
      <Text
        style={{
          fontFamily: "Gabarito-Regular",
          fontSize: 16,
          marginVertical: 8,
        }}
        onPress={() => router.push("/login")}
      >
        already have an account? login.
      </Text>
    </Layout>
  );
}
