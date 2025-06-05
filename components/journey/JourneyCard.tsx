import Ionicons from "@expo/vector-icons/Ionicons";
import { Card, MenuItem, OverflowMenu } from "@ui-kitten/components";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Journey } from "../../types";
import { getFirstStep, getNextUncompletedStep } from "../../utils/journeyUtils";
import {
  OverflowMenuAnchor,
  overflowMenuBackdropStyle,
} from "../ui/OverflowMenu";
import { ProgressCircle } from "../ui/ProgressCircle";

interface JourneyCardProps {
  journey: Journey;
  onPress: () => void;
  onDelete: () => void;
  menuVisible: boolean;
  onMenuToggle: (visible: boolean) => void;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({
  journey,
  onPress,
  onDelete,
  menuVisible,
  onMenuToggle,
}) => {
  const DeleteIcon = (props: any) => (
    <Ionicons name="trash-outline" size={20} color={props.style.tintColor} />
  );

  const getStepInfo = () => {
    if (!journey.aiGeneratedPlan || journey.aiGeneratedPlan.length === 0) {
      return { text: "No steps available", label: "Plan:" };
    }

    const nextStep = getNextUncompletedStep(journey.aiGeneratedPlan);
    if (nextStep) {
      return { text: nextStep.text, label: "Next Step:" };
    }

    const firstStep = getFirstStep(journey.aiGeneratedPlan);
    if (firstStep) {
      return { text: firstStep.text, label: "First Step:" };
    }

    return { text: "No steps", label: "Plan:" };
  };

  const stepInfo = getStepInfo();

  return (
    <Card style={styles.goalCard}>
      <View style={styles.goalCardContent}>
        <TouchableOpacity style={styles.cardTouchable} onPress={onPress}>
          <ProgressCircle value={journey.progress || 0} />
          <View style={styles.goalTextContainer}>
            <Text style={styles.goalCardTitle}>
              {journey.title.toLowerCase()}
            </Text>
            <Text style={styles.goalCardDescription} numberOfLines={1}>
              {journey.description || stepInfo.text}
            </Text>
          </View>
        </TouchableOpacity>

        <OverflowMenu
          visible={menuVisible}
          anchor={() => (
            <OverflowMenuAnchor onPress={() => onMenuToggle(true)} />
          )}
          onBackdropPress={() => onMenuToggle(false)}
          backdropStyle={overflowMenuBackdropStyle}
        >
          <MenuItem
            title={(props: any) => (
              <Text style={[props.style, styles.menuItemText]}>delete.</Text>
            )}
            accessoryLeft={DeleteIcon}
            onPress={onDelete}
          />
        </OverflowMenu>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  goalCard: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  goalCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTouchable: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  goalTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  goalCardTitle: {
    fontSize: 18,
    fontFamily: "Gabarito-Bold",
    color: "#333333",
    marginBottom: 4,
  },
  goalCardDescription: {
    fontSize: 14,
    fontFamily: "Gabarito-Regular",
    color: "#666666",
  },
  menuItemText: {
    fontFamily: "Gabarito-Regular",
    fontSize: 16,
  },
});
