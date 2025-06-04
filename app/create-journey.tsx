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
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
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
      console.warn(
        "[create-journey] User not logged in. Cannot create journey."
      );
      return;
    }

    if (!title.trim()) {
      console.warn(
        "[create-journey] Journey title is missing. Cannot create journey."
      );
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
      description: journeyFormDetails.description || "",
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

      console.log(
        "[create-journey] Basic journey added with ID: ",
        journeyRef.id
      );

      try {
        console.log(
          "[create-journey] Attempting to generate AI plan for journey:",
          journeyRef.id
        );
        // Construct the data payload for the AI service
        const aiRequestData = {
          title: journeyFormDetails.title, // Corrected field name
          description: journeyFormDetails.description,
          priority: journeyFormDetails.priority,
          lengthOfTime: journeyFormDetails.lengthOfTime,
        };

        const aiResponse = await getAIGoalBreakdown(aiRequestData);
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
            aiGeneratedPlan: aiResponse.aiGeneratedPlan,
            updatedAt: serverTimestamp(),
          });
          console.log(
            "[create-journey] AI plan generated and saved for journey: ",
            journeyRef.id
          );
        } else {
          console.log(
            "[create-journey] AI Response (or plan) was empty or missing for journey ID " +
              journeyRef.id +
              ":",
            JSON.stringify(aiResponse, null, 2)
          ); // Log if plan is missing
        }
      } catch (aiError) {
        console.error(
          "[create-journey] Error generating AI plan for journey ID " +
            journeyRef.id +
            ": ",
          aiError
        );
      }

      router.push({ pathname: "/journey/[id]", params: { id: journeyRef.id } });
      console.log(
        `[create-journey] Navigating to new journey page: /journey/${journeyRef.id}`
      );
    } catch (error) {
      console.error("[create-journey] Error creating journey: ", error);
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
