import Navbar from "@/components/home/navbar";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Tabs
        tabBar={(props) => <Navbar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="home" options={{ title: "home" }} />
        <Tabs.Screen name="journeys" options={{ title: "journeys" }} />
        <Tabs.Screen name="you" options={{ title: "you" }} />
      </Tabs>
    </View>
  );
}
