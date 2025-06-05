import Ionicons from "@expo/vector-icons/Ionicons";
import { Button } from "@ui-kitten/components";
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { Journey } from "../../types";

interface DailyTasksModalProps {
  visible: boolean;
  journey: Journey | null;
  onClose: () => void;
}

export const DailyTasksModal: React.FC<DailyTasksModalProps> = ({
  visible,
  journey,
  onClose,
}) => {
  if (!journey) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Daily Tasks for: {journey.title}
          </Text>
          {journey.dailyTasks?.length ? (
            journey.dailyTasks.map((task: string, index: number) => (
              <View key={index} style={styles.modalTaskItem}>
                <Ionicons
                  name="flash-outline"
                  size={18}
                  color="#FFC107"
                  style={styles.modalTaskIcon}
                />
                <Text style={styles.modalTaskText}>{task}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.modalTaskText}>
              No daily tasks specified for this journey.
            </Text>
          )}
          <Button onPress={onClose} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Gabarito-Bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333333",
  },
  modalTaskItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 10,
    width: "100%",
  },
  modalTaskIcon: {
    marginRight: 10,
  },
  modalTaskText: {
    fontSize: 14,
    fontFamily: "Gabarito-Regular",
    color: "#666666",
    flex: 1,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: "#000000",
    borderColor: "#000000",
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Gabarito-Bold",
  },
});
