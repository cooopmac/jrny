import { Tabs } from "expo-router";
import React from "react";
// chnaging over

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 60,
          backgroundColor: "#f1f2f4",
          borderTopWidth: 1,
          borderColor: "#e0e0e0",
          borderRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 16,
          fontFamily: "Gabarito-Bold",
          transform: [{ translateY: -12 }],
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "home",
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="journeys"
        options={{
          title: "journeys",
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: "you",
          tabBarIcon: () => null,
        }}
      />
    </Tabs>
  );
}
