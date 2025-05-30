import { Layout, Text } from "@ui-kitten/components"; // Assuming UI Kitten for layout
import React from "react";

export default function AuthLoadingScreen() {
  return (
    <Layout style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text category="h1">Auth Loading Screen</Text>
    </Layout>
  );
}
