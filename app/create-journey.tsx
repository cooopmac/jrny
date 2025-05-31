import Ionicons from "@expo/vector-icons/Ionicons"; // For calendar icon
import { getAuth } from "@react-native-firebase/auth";
import firestore, { serverTimestamp } from "@react-native-firebase/firestore";
import {
  Button,
  Datepicker,
  IndexPath,
  Input,
  Layout,
  Select,
  SelectItem,
  Text,
} from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";

// Define Journey interface (can be shared if in a types file)
interface JourneyData {
  title: string;
  // description?: string;
  lengthOfTime?: string; // e.g., "30 days", "2 weeks"
  priority?: "Low" | "Medium" | "High";
  endDate?: Date;
  userId: string;
  status: "Planned" | "Active" | "Completed";
  progress: number;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

const priorityOptions = ["Low", "Medium", "High"];

export default function CreateJourneyScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [lengthOfTime, setLengthOfTime] = useState("");
  const [selectedPriorityIndex, setSelectedPriorityIndex] = useState<
    IndexPath | undefined
  >(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleSaveJourney = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "You must be logged in to create a journey.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your journey.");
      return;
    }

    const journeyDetails: Omit<
      JourneyData,
      "id" | "createdAt" | "updatedAt" | "userId" | "status" | "progress"
    > &
      Partial<Pick<JourneyData, "status" | "progress">> = {
      title: title.trim(),
      lengthOfTime: lengthOfTime.trim() || undefined,
      priority: selectedPriorityIndex
        ? (priorityOptions[
            selectedPriorityIndex.row
          ] as JourneyData["priority"])
        : undefined,
      endDate: endDate,
    };

    const newJourneyData: Omit<JourneyData, "id"> = {
      ...journeyDetails,
      userId: user.uid,
      status: "Planned", // Default status
      progress: 0, // Default progress
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await firestore().collection("journeys").add(newJourneyData);
      Alert.alert("Success", "Journey created successfully!");
      router.back(); // Go back to the previous screen (JourneysScreen)
    } catch (error) {
      console.error("Error creating journey: ", error);
      Alert.alert("Error", "Could not create journey. Please try again.");
    }
  };

  const CalendarIcon = (props: any) => (
    <Ionicons name="calendar-outline" size={24} color={props.style.tintColor} />
  );

  return (
    <Layout style={styles.container} level="1">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text category="h4" style={styles.header}>
          Create New Journey
        </Text>

        <Input
          label="Journey Title"
          placeholder="What's your new adventure?"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <Input
          label="Length of Time (Optional)"
          placeholder="e.g., 30 days, 2 months"
          value={lengthOfTime}
          onChangeText={setLengthOfTime}
          style={styles.input}
        />

        <Select
          label="Priority (Optional)"
          placeholder="Select priority"
          selectedIndex={selectedPriorityIndex}
          onSelect={(index) => setSelectedPriorityIndex(index as IndexPath)}
          value={
            selectedPriorityIndex
              ? priorityOptions[selectedPriorityIndex.row]
              : ""
          }
          style={styles.input}
        >
          {priorityOptions.map((p) => (
            <SelectItem title={p} key={p} />
          ))}
        </Select>

        <Datepicker
          label="End Date (Optional)"
          placeholder="Pick an end date"
          date={endDate}
          onSelect={(nextDate) => setEndDate(nextDate)}
          accessoryRight={CalendarIcon}
          style={styles.input}
        />

        <Button onPress={handleSaveJourney} style={styles.saveButton}>
          Save Journey
        </Button>
        <Button
          onPress={() => router.back()}
          appearance="ghost"
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Gabarito-Bold",
  },
  input: {
    marginBottom: 15,
  },
  saveButton: {
    marginTop: 20,
  },
  cancelButton: {
    marginTop: 10,
  },
});
