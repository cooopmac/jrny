import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface OverflowMenuAnchorProps {
  onPress: () => void;
  iconSize?: number;
  iconColor?: string;
}

export const OverflowMenuAnchor: React.FC<OverflowMenuAnchorProps> = ({
  onPress,
  iconSize = 24,
  iconColor = "#333333",
}) => {
  return (
    <TouchableOpacity style={styles.menuAnchorButton} onPress={onPress}>
      <Ionicons name="ellipsis-vertical" size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

export const overflowMenuBackdropStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.5)",
};

const styles = StyleSheet.create({
  menuAnchorButton: {
    padding: 8,
  },
});
