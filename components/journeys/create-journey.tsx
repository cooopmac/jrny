import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
    Animated.createAnimatedComponent(TouchableOpacity);

export default function CreateJourneyButton({
    onPress,
}: {
    onPress: () => void;
}) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        scale.value = withSpring(0.95, { damping: 12 }, () => {
            scale.value = withSpring(1);
        });
        onPress();
    };

    return (
        <AnimatedTouchableOpacity
            style={[styles.createButton, animatedStyle]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <View style={styles.createButtonContent}>
                <Text style={styles.plusIcon}>+</Text>
                <Text style={styles.createButtonText}>start new journey</Text>
            </View>
        </AnimatedTouchableOpacity>
    );
}

const styles = StyleSheet.create({
    createButton: {
        backgroundColor: "#f3f4f6",
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: "#e5e7eb",
        borderStyle: "dashed",
    },
    createButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    plusIcon: {
        fontSize: 24,
        fontFamily: "Gabarito-Regular",
        color: "#6b7280",
        marginRight: 8,
    },
    createButtonText: {
        fontSize: 16,
        fontFamily: "Gabarito-Bold",
        color: "#6b7280",
    },
});
