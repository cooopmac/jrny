import React from "react";
import CircularProgress from "react-native-circular-progress-indicator";

interface ProgressCircleProps {
  value: number;
  radius?: number;
  activeStrokeWidth?: number;
  inActiveStrokeWidth?: number;
  inActiveStrokeColor?: string;
  progressValueStyle?: object;
  showText?: boolean;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  radius = 25,
  activeStrokeWidth = 5,
  inActiveStrokeWidth = 5,
  inActiveStrokeColor = "#E0E0E0",
  progressValueStyle,
  showText = true,
}) => {
  return (
    <CircularProgress
      value={value}
      radius={radius}
      valueSuffix={showText ? "%" : ""}
      activeStrokeWidth={activeStrokeWidth}
      inActiveStrokeWidth={inActiveStrokeWidth}
      inActiveStrokeColor={inActiveStrokeColor}
      progressValueStyle={progressValueStyle}
    />
  );
};
