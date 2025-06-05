import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { JourneyStatus } from "../../types";

interface StatusDotProps {
  status: JourneyStatus;
  showLabel?: boolean;
  size?: "small" | "medium" | "large";
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  showLabel = true,
  size = "medium",
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "Active":
        return "#4CAF50"; // Green
      case "Planned":
        return "#FF9800"; // Orange
      case "Completed":
        return "#2196F3"; // Blue
      default:
        return "#9E9E9E"; // Gray
    }
  };

  const getDotSize = () => {
    switch (size) {
      case "small":
        return 8;
      case "medium":
        return 10;
      case "large":
        return 12;
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.dot,
          {
            backgroundColor: getStatusColor(),
            width: getDotSize(),
            height: getDotSize(),
          },
        ]}
      />
      {showLabel && <Text style={styles.label}>{status}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    borderRadius: 50,
  },
  label: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "Gabarito-Regular",
  },
});
