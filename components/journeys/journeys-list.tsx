import { JourneyDisplay } from "@/types/journey";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    FadeInDown,
    FadeInUp,
    LinearTransition,
} from "react-native-reanimated";
import JourneyCard from "./journey-card";

export default function JourneysList({
    journeys,
    onJourneyPress,
    isLoading,
}: {
    journeys: JourneyDisplay[];
    onJourneyPress: (journey: JourneyDisplay) => void;
    isLoading?: boolean;
}) {
    if (isLoading) {
        return (
            <Animated.View
                entering={FadeInUp.duration(400)}
                style={styles.loadingContainer}
            >
                <ActivityIndicator size="large" color="#000" />
            </Animated.View>
        );
    }

    return (
        <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {journeys.map((journey, index) => (
                <Animated.View
                    key={journey.id}
                    entering={FadeInDown.duration(600)
                        .delay(300 + index * 100) // Stagger each card by 100ms
                        .easing(Easing.out(Easing.cubic))
                        .springify()
                        .damping(15)
                        .mass(1)
                        .stiffness(150)}
                    layout={LinearTransition.springify()}
                    style={styles.cardWrapper}
                >
                    <JourneyCard journey={journey} onPress={onJourneyPress} />
                </Animated.View>
            ))}

            {/* Bottom spacing for navigation */}
            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    cardWrapper: {
        width: "100%",
    },
    bottomSpacing: {
        height: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
