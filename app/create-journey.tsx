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
import {
  ActivityIndicator,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native"; // Consolidated imports
import { getAIGoalBreakdown } from "../services/aiService";
import { Journey, JourneyFormData } from "../types";

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
    setIsSaving(true);

    if (!title.trim()) {
      console.warn(
        "[create-journey] Journey title is missing. Cannot create journey."
      );
      setIsSaving(false);
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.warn(
        "[create-journey] User not logged in. Cannot create journey."
      );
      setIsSaving(false);
      return;
    }

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

        if (aiResponse) {
          const updateData: {
            updatedAt: any;
            aiGeneratedPlan?: Array<{ text: string; completed: boolean }>;
            dailyTasks?: string[];
          } = {
            updatedAt: serverTimestamp(),
          };

          let dataWasUpdated = false;

          if (
            aiResponse.aiGeneratedPlan &&
            aiResponse.aiGeneratedPlan.length > 0
          ) {
            updateData.aiGeneratedPlan = aiResponse.aiGeneratedPlan;
            dataWasUpdated = true;
            console.log(
              "[create-journey] AI plan will be saved:",
              JSON.stringify(aiResponse.aiGeneratedPlan, null, 2)
            );
          }

          if (aiResponse.dailyTasks && aiResponse.dailyTasks.length > 0) {
            updateData.dailyTasks = aiResponse.dailyTasks;
            dataWasUpdated = true;
            console.log(
              "[create-journey] Daily tasks will be saved:",
              JSON.stringify(aiResponse.dailyTasks, null, 2)
            );
          }

          if (dataWasUpdated) {
            await journeyRef.update(updateData);
            console.log(
              "[create-journey] AI data (plan and/or daily tasks) generated and saved for journey: ",
              journeyRef.id
            );
          } else {
            console.log(
              "[create-journey] AI Response did not contain a plan or daily tasks for journey ID " +
                journeyRef.id +
                ":",
              JSON.stringify(aiResponse, null, 2)
            ); // Log if plan/tasks are missing
          }
        } else {
          console.log(
            "[create-journey] No AI Response object received for journey ID " +
              journeyRef.id
          );
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
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => router.back()}
          disabled={isSaving}
        >
          <Ionicons
            name="arrow-back-outline"
            size={24} // Slightly larger for better touch target
            color="#333333" // Consistent with header text color
          />
          <Text style={styles.backButtonText}>back</Text>
        </TouchableOpacity>

        <Text category="h4" style={styles.header}>
          create new journey.
        </Text>

        <Input
          label="Journey Title"
          placeholder="What's your new adventure?"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          disabled={isSaving}
          size="large"
        />

        <Input
          label="Description (Optional)"
          placeholder="e.g., A brief overview of your goal"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          multiline={true}
          textStyle={{ minHeight: 64, textAlignVertical: "top" }}
          disabled={isSaving}
          size="large"
        />

        <Input
          label="Length of Time (Optional)"
          placeholder="e.g., 30 days, 2 months, 1 year"
          value={lengthOfTime}
          onChangeText={setLengthOfTime}
          style={styles.input}
          disabled={isSaving}
          size="large"
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
          size="large"
        >
          {priorityOptions.map((option) => (
            <SelectItem key={option} title={option} />
          ))}
        </Select>

        <Datepicker
          label="End Date (Optional)"
          placeholder="Pick a target date"
          date={endDate}
          onSelect={setEndDate}
          accessoryRight={CalendarIcon}
          style={styles.input}
          disabled={isSaving}
          size="large"
        />

        {isSaving ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <Button
            style={styles.saveButton}
            onPress={handleSaveJourney}
            disabled={isSaving || !title.trim()}
            size="large"
          >
            {(props: { style?: StyleProp<TextStyle> }) => (
              <Text {...props} style={[props.style, styles.saveButtonText]}>
                Create Journey & Get AI Plan ✨
              </Text>
            )}
          </Button>
        )}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f2f4",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButtonText: {
    fontFamily: "Gabarito-Regular",
    fontSize: 16,
    color: "#333333",
    marginLeft: 4,
  },
  header: {
    fontFamily: "Gabarito-ExtraBold",
    fontSize: 28,
    marginBottom: 24,
    color: "#333333",
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
    borderRadius: 20,
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: "#000000",
    borderRadius: 25,
    paddingVertical: 5,
  },
  saveButtonText: {
    color: "#ffffff",
    fontFamily: "Gabarito-Bold",
    fontSize: 16,
  },
  loadingContainer: {
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
