import { JourneyDisplay } from "@/types/journey";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
    Animated.createAnimatedComponent(TouchableOpacity);

const CATEGORIES = [
    { id: "business", label: "Business", color: "#8b5cf6" },
    { id: "learning", label: "Learning", color: "#06b6d4" },
    { id: "fitness", label: "Fitness", color: "#f59e0b" },
    { id: "personal", label: "Personal", color: "#10b981" },
] as const;

const STATUS_COLORS = {
    Planned: "#f59e0b", // Yellow
    Active: "#10b981", // Green
    Completed: "#ef4444", // Red
} as const;

export default function JourneyCard({
    journey,
    onPress,
}: {
    journey: JourneyDisplay;
    onPress: (journey: JourneyDisplay) => void;
}) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const handlePress = () => {
        scale.value = withSpring(0.98, { damping: 15 }, () => {
            scale.value = withSpring(1);
        });
        opacity.value = withTiming(0.8, { duration: 100 }, () => {
            opacity.value = withTiming(1, { duration: 100 });
        });
        onPress(journey);
    };

    const category = CATEGORIES.find((cat) => cat.id === journey.category);
    const statusColor =
        STATUS_COLORS[journey.status as keyof typeof STATUS_COLORS] ||
        "#6b7280";

    return (
        <AnimatedTouchableOpacity
            style={[styles.journeyCard, animatedStyle]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <View style={styles.journeyContent}>
                <View style={styles.journeyInfo}>
                    <Text style={styles.journeyTitle}>{journey.title}</Text>
                    <Text style={styles.description}>
                        {journey.description}
                    </Text>
                    <View style={styles.metadata}>
                        <View style={styles.statusContainer}>
                            <View
                                style={[
                                    styles.statusDot,
                                    { backgroundColor: statusColor },
                                ]}
                            />
                            <Text style={styles.status}>{journey.status}</Text>
                        </View>
                        <Text
                            style={[
                                styles.category,
                                {
                                    backgroundColor: journey.color,
                                    color: "white",
                                },
                            ]}
                        >
                            {category?.label || journey.category}
                        </Text>
                        <Text style={styles.priority}>{journey.priority}</Text>
                        {journey.lengthOfTime && (
                            <Text style={styles.lengthOfTime}>
                                {journey.lengthOfTime}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.progressSection}>
                    <Text style={styles.progressText}>{journey.progress}%</Text>
                </View>
            </View>

            <View style={styles.progressBar}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${journey.progress}%`,
                            backgroundColor: journey.color,
                        },
                    ]}
                />
            </View>
        </AnimatedTouchableOpacity>
    );
}

const styles = StyleSheet.create({
    journeyCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    journeyContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    journeyInfo: {
        flex: 1,
        marginRight: 12,
    },
    journeyTitle: {
        fontSize: 18,
        fontFamily: "Gabarito-ExtraBold",
        color: "#000000",
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        fontFamily: "Gabarito-Regular",
        color: "#6b7280",
        marginBottom: 8,
    },
    metadata: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    status: {
        fontSize: 12,
        fontFamily: "Gabarito-Medium",
        color: "#4b5563",
    },
    category: {
        fontSize: 12,
        fontFamily: "Gabarito-Medium",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    priority: {
        fontSize: 12,
        fontFamily: "Gabarito-Medium",
        color: "#4b5563",
        backgroundColor: "#f3f4f6",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    lengthOfTime: {
        fontSize: 12,
        fontFamily: "Gabarito-Medium",
        color: "#4b5563",
        backgroundColor: "#f3f4f6",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    progressSection: {
        alignItems: "flex-end",
    },
    progressText: {
        fontSize: 16,
        fontFamily: "Gabarito-Bold",
        color: "#000000",
    },
    progressBar: {
        height: 4,
        backgroundColor: "#f3f4f6",
        borderRadius: 2,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 2,
    },
});
