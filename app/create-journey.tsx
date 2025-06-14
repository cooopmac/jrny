import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = [
    { id: "business", label: "Business", color: "#8b5cf6" },
    { id: "learning", label: "Learning", color: "#06b6d4" },
    { id: "fitness", label: "Fitness", color: "#f59e0b" },
    { id: "personal", label: "Personal", color: "#10b981" },
] as const;

const PRIORITIES = ["Low", "Medium", "High"] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];
type Priority = (typeof PRIORITIES)[number];

export default function CreateJourneyScreen() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<CategoryId | "">(
        ""
    );
    const [selectedPriority, setSelectedPriority] =
        useState<Priority>("Medium");
    const [lengthOfTime, setLengthOfTime] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateJourney = async () => {
        if (!title || !description || !selectedCategory) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        setIsLoading(true);

        try {
            // Get the current user
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("No user found");
            }

            // Create the journey
            const { data, error } = await supabase
                .from("journeys")
                .insert([
                    {
                        title,
                        description,
                        status: "Planned",
                        progress: 0,
                        category: selectedCategory,
                        user_id: user.id,
                        color:
                            CATEGORIES.find(
                                (cat) => cat.id === selectedCategory
                            )?.color || "#8b5cf6",
                        priority: selectedPriority,
                        length_of_time: lengthOfTime || null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            // Navigate to the journey details page
            router.replace({
                pathname: "/journey/[id]",
                params: { id: data.id },
            });
        } catch (error: any) {
            console.error("Error creating journey:", error);
            Alert.alert("Error", error.message || "Failed to create journey");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.backButton}>← back</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>create journey. lol</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="What's your journey?"
                            value={title}
                            onChangeText={setTitle}
                            placeholderTextColor="#9ca3af"
                        />

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe your journey..."
                            value={description}
                            onChangeText={setDescription}
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={4}
                        />

                        <Text style={styles.label}>Category</Text>
                        <View style={styles.categories}>
                            {CATEGORIES.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryButton,
                                        selectedCategory === category.id && {
                                            backgroundColor: category.color,
                                        },
                                    ]}
                                    onPress={() =>
                                        setSelectedCategory(category.id)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            selectedCategory === category.id &&
                                                styles.selectedCategoryText,
                                        ]}
                                    >
                                        {category.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Priority</Text>
                        <View style={styles.priorities}>
                            {PRIORITIES.map((priority) => (
                                <TouchableOpacity
                                    key={priority}
                                    style={[
                                        styles.priorityButton,
                                        selectedPriority === priority &&
                                            styles.selectedPriorityButton,
                                    ]}
                                    onPress={() =>
                                        setSelectedPriority(priority)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.priorityText,
                                            selectedPriority === priority &&
                                                styles.selectedPriorityText,
                                        ]}
                                    >
                                        {priority}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>
                            Length of Time (Optional)
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 3 months, 1 year"
                            value={lengthOfTime}
                            onChangeText={setLengthOfTime}
                            placeholderTextColor="#9ca3af"
                        />

                        <TouchableOpacity
                            style={[
                                styles.createButton,
                                isLoading && styles.createButtonDisabled,
                            ]}
                            onPress={handleCreateJourney}
                            disabled={isLoading}
                        >
                            <Text style={styles.createButtonText}>
                                {isLoading ? "Creating..." : "Create Journey"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
    },
    backButton: {
        fontSize: 16,
        color: "#374151",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#111827",
    },
    placeholder: {
        width: 40,
    },
    form: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    input: {
        borderWidth: 2,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 20,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    categories: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 20,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#e5e7eb",
    },
    categoryText: {
        fontSize: 14,
        color: "#374151",
    },
    selectedCategoryText: {
        color: "white",
    },
    priorities: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 20,
    },
    priorityButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#e5e7eb",
        alignItems: "center",
    },
    selectedPriorityButton: {
        backgroundColor: "#000",
        borderColor: "#000",
    },
    priorityText: {
        fontSize: 14,
        color: "#374151",
    },
    selectedPriorityText: {
        color: "white",
    },
    createButton: {
        backgroundColor: "#000",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    createButtonDisabled: {
        opacity: 0.7,
    },
    createButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});
