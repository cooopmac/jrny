import * as eva from "@eva-design/eva";
import { ApplicationProvider, Layout } from "@ui-kitten/components";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const InitializationScreen = () => {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout style={styles.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontFamily: "Gabarito-ExtraBold", fontSize: 42 }}>
            jrny.
          </Text>
          <ActivityIndicator
            size="large"
            color="#000000"
            style={{ padding: 4 }}
          />
          <Text style={styles.subText}>Loading...</Text>
        </View>
      </Layout>
    </ApplicationProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f2f4",
  },
  content: {
    alignItems: "center",
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    // fontFamily: 'Gabarito-SemiBold', // You can uncomment this if Gabarito-SemiBold is globally available here
  },
  subText: {
    marginTop: 8,
    fontSize: 14,
    color: "gray",
    // fontFamily: 'Gabarito-Regular', // You can uncomment this if Gabarito-Regular is globally available here
  },
});

export default InitializationScreen;
