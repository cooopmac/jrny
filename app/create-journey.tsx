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
import { ActivityIndicator, Alert, ScrollView, StyleSheet } from "react-native";
import { getAIGoalBreakdown } from "../services/aiService";
import { Journey } from "../services/journeyService";

// Define JourneyData interface (local to this file for form handling)
interface JourneyFormData {
  title: string;
  description?: string;
  lengthOfTime?: string;
  priority?: "Low" | "Medium" | "High";
  endDate?: Date;
}

const priorityOptions = ["Low", "Medium", "High"];

export default function CreateJourneyScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lengthOfTime, setLengthOfTime] = useState("");
  const [selectedPriorityIndex, setSelectedPriorityIndex] = useState<
    IndexPath | undefined
  >(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

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

    setIsSaving(true);

    const journeyFormDetails: JourneyFormData = {
      title: title.trim(),
      description: description.trim() || undefined,
      lengthOfTime: lengthOfTime.trim() || undefined,
      priority: selectedPriorityIndex
        ? (priorityOptions[
            selectedPriorityIndex.row
          ] as JourneyFormData["priority"])
        : undefined,
      endDate: endDate,
    };

    const newJourneyBase: Omit<
      Journey,
      "id" | "createdAt" | "updatedAt" | "aiPlan"
    > = {
      ...journeyFormDetails,
      userId: user.uid,
      status: "Planned",
      progress: 0,
    };

    try {
      // Add basic journey data
      const dataToSave: Partial<Journey> & {
        createdAt: any;
        updatedAt: any;
        userId: string;
        status: string;
        progress: number;
      } = {
        ...newJourneyBase,
        userId: user.uid, // Ensure userId is part of dataToSave from newJourneyBase or explicitly
        status: "Planned", // Ensure status is part of dataToSave
        progress: 0, // Ensure progress is part of dataToSave
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Remove undefined properties before saving to Firestore
      Object.keys(dataToSave).forEach((key) => {
        if (dataToSave[key as keyof typeof dataToSave] === undefined) {
          delete dataToSave[key as keyof typeof dataToSave];
        }
      });

      const journeyRef = await firestore()
        .collection("journeys")
        .add(dataToSave);

      console.log("Basic journey added with ID: ", journeyRef.id);

      try {
        Alert.alert(
          "AI Assistant",
          "Generating an initial plan for your journey..."
        );
        const aiResponse = await getAIGoalBreakdown({
          journeyTitle: newJourneyBase.title,
          journeyId: journeyRef.id,
        });
        console.log(
          "[create-journey] AI Response received:",
          JSON.stringify(aiResponse, null, 2)
        ); // Log AI response

        if (
          aiResponse &&
          aiResponse.aiGeneratedPlan &&
          aiResponse.aiGeneratedPlan.length > 0
        ) {
          console.log(
            "[create-journey] Attempting to save AI plan:",
            JSON.stringify(aiResponse.aiGeneratedPlan, null, 2)
          ); // Log plan to be saved
          await journeyRef.update({
            aiPlan: aiResponse.aiGeneratedPlan,
            updatedAt: serverTimestamp(),
          });
          console.log(
            "AI plan generated and saved for journey: ",
            journeyRef.id
          );
          Alert.alert("Success", "Journey created and AI plan generated!");
        } else {
          console.log(
            "[create-journey] AI Response (or plan) was empty or missing:",
            JSON.stringify(aiResponse, null, 2)
          ); // Log if plan is missing
          Alert.alert(
            "Success",
            "Journey created! (AI plan was not generated or was empty)"
          );
        }
      } catch (aiError) {
        console.error("Error generating AI plan: ", aiError);
        Alert.alert(
          "Journey Created",
          "Journey created, but there was an issue generating the AI plan. You can try generating it later."
        );
      }

      router.back();
    } catch (error) {
      console.error("Error creating journey: ", error);
      Alert.alert("Error", "Could not create journey. Please try again.");
    } finally {
      setIsSaving(false);
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
          disabled={isSaving}
        />

        <Input
          label="Description (Optional)"
          placeholder="e.g., A brief overview"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          disabled={isSaving}
        />

        <Input
          label="Length of Time (Optional)"
          placeholder="e.g., 30 days, 2 months"
          value={lengthOfTime}
          onChangeText={setLengthOfTime}
          style={styles.input}
          disabled={isSaving}
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
          disabled={isSaving}
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
          disabled={isSaving}
        />

        {isSaving ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.saveButton}
          />
        ) : (
          <Button
            onPress={handleSaveJourney}
            style={styles.saveButton}
            disabled={isSaving}
          >
            Save Journey & Generate Plan
          </Button>
        )}
        <Button
          onPress={() => router.back()}
          appearance="ghost"
          style={styles.cancelButton}
          disabled={isSaving}
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
