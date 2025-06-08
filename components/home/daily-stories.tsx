// StoriesSection.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Sample data for stories
const storiesData = [
  {
    id: 1,
    title: "NASA",
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg",
    backgroundColor: "black",
    tasks: [
      { id: 1, text: "Review mission parameters", completed: true },
      { id: 2, text: "Complete astronaut training module", completed: false },
      { id: 3, text: "Submit research proposal", completed: false },
      { id: 4, text: "Attend team briefing", completed: true },
    ],
  },
  {
    id: 2,
    title: "Fitness",
    backgroundColor: "#FF6B6B",
    tasks: [
      { id: 1, text: "Morning workout - 30 mins", completed: false },
      { id: 2, text: "Drink 8 glasses of water", completed: false },
      { id: 3, text: "10,000 steps", completed: false },
      { id: 4, text: "Stretching routine", completed: false },
    ],
  },
  {
    id: 3,
    title: "Learning",
    backgroundColor: "#4ECDC4",
    tasks: [
      { id: 1, text: "Read 20 pages", completed: true },
      { id: 2, text: "Complete online course module", completed: false },
      { id: 3, text: "Practice new skill for 30 mins", completed: false },
      { id: 4, text: "Review notes", completed: false },
    ],
  },
];

// Story Circle Component with Gradient
const StoryCircle = ({
  story,
  onPress,
  index,
  isViewed,
}: {
  story: any;
  onPress: (story: any) => void;
  index: number;
  isViewed: boolean;
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
    opacity.value = withSpring(0.8);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withSpring(1);
  };

  // Rainbow gradient colors
  const rainbowColors = [
    "#FF0000",
    "#FF7F00",
    "#FFFF00",
    "#00FF00",
    "#0000FF",
    "#4B0082",
    "#9400D3",
  ] as const;

  return (
    <TouchableOpacity
      onPress={() => onPress(story)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.storyContainer}
    >
      <Animated.View style={[styles.storyCircle, animatedStyle]}>
        {isViewed ? (
          // Grey border for viewed stories
          <View style={[styles.storyBorder, styles.viewedBorder]}>
            <View
              style={[
                styles.storyImageContainer,
                { backgroundColor: story.backgroundColor },
              ]}
            >
              <Text style={styles.storyInitial}>{story.title[0]}</Text>
            </View>
          </View>
        ) : (
          // Rainbow gradient for unviewed stories
          <LinearGradient
            colors={rainbowColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          >
            <View style={styles.gradientInner}>
              <View
                style={[
                  styles.storyImageContainer,
                  { backgroundColor: story.backgroundColor },
                ]}
              >
                <Text style={styles.storyInitial}>{story.title[0]}</Text>
              </View>
            </View>
          </LinearGradient>
        )}
      </Animated.View>
      <Text style={styles.storyTitle}>{story.title}</Text>
    </TouchableOpacity>
  );
};

// Task Item Component
const TaskItem = ({ task, index }: { task: any; index: number }) => {
  const translateX = useSharedValue(-SCREEN_WIDTH);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
    opacity.value = withTiming(1, {
      duration: 300,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.taskItem, animatedStyle]}>
      <View
        style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
      >
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text
        style={[styles.taskText, task.completed && styles.taskTextCompleted]}
      >
        {task.text}
      </Text>
    </Animated.View>
  );
};

// Story Card Modal Component
const StoryCard = ({
  story,
  visible,
  onClose,
}: {
  story: any;
  visible: boolean;
  onClose: () => void;
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backgroundOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 100,
      });
      backgroundOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT);
      backgroundOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    },
    onEnd: (event) => {
      if (event.translationY > 100) {
        translateY.value = withSpring(SCREEN_HEIGHT);
        backgroundOpacity.value = withTiming(0, { duration: 300 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0);
      }
    },
  });

  if (!story) return null;

  const completedTasks = story.tasks.filter(
    (task: any) => task.completed
  ).length;
  const progress = (completedTasks / story.tasks.length) * 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.modalContainer}>
        <Animated.View style={[styles.modalBackground, backgroundStyle]}>
          <TouchableOpacity
            style={styles.modalBackgroundTouch}
            onPress={onClose}
          />
        </Animated.View>

        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.storyCard, cardStyle]}>
            <View style={styles.dragIndicator} />

            <View
              style={[
                styles.cardHeader,
                { backgroundColor: story.backgroundColor },
              ]}
            >
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>{story.title[0]}</Text>
              </View>
              <Text style={styles.cardTitle}>{story.title}</Text>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.progressSection}>
                <Text style={styles.progressText}>Today's Progress</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
                <Text style={styles.progressPercentage}>
                  {completedTasks}/{story.tasks.length} tasks completed
                </Text>
              </View>

              <Text style={styles.tasksTitle}>Daily Tasks</Text>
              {story.tasks.map((task: any, index: any) => (
                <TaskItem key={task.id} task={task} index={index} />
              ))}
            </View>
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    </Modal>
  );
};

// Main Component
export default function StoriesSection() {
  const [selectedStory, setSelectedStory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewedStories, setViewedStories] = useState<Set<number>>(new Set());

  // Load viewed stories and check if it's a new day
  useEffect(() => {
    loadViewedStories();
  }, []);

  const loadViewedStories = async () => {
    try {
      const storedData = await AsyncStorage.getItem("viewedStories");
      const lastResetDate = await AsyncStorage.getItem("lastResetDate");
      const today = new Date().toDateString();

      if (lastResetDate !== today) {
        // It's a new day, reset viewed stories
        await AsyncStorage.setItem("lastResetDate", today);
        await AsyncStorage.removeItem("viewedStories");
        setViewedStories(new Set());
      } else if (storedData) {
        // Load existing viewed stories
        setViewedStories(new Set(JSON.parse(storedData)));
      }
    } catch (error) {
      console.error("Error loading viewed stories:", error);
    }
  };

  const markStoryAsViewed = async (storyId: number) => {
    try {
      const newViewedStories = new Set(viewedStories);
      newViewedStories.add(storyId);
      setViewedStories(newViewedStories);

      await AsyncStorage.setItem(
        "viewedStories",
        JSON.stringify(Array.from(newViewedStories))
      );
    } catch (error) {
      console.error("Error saving viewed stories:", error);
    }
  };

  const handleStoryPress = useCallback(
    (story: any) => {
      setSelectedStory(story);
      setModalVisible(true);
      markStoryAsViewed(story.id);
    },
    [viewedStories]
  );

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setSelectedStory(null), 300);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesScrollContainer}
      >
        {storiesData.map((story, index) => (
          <StoryCircle
            key={story.id}
            story={story}
            index={index}
            onPress={handleStoryPress}
            isViewed={viewedStories.has(story.id)}
          />
        ))}
      </ScrollView>

      <StoryCard
        story={selectedStory}
        visible={modalVisible}
        onClose={handleCloseModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingTop: 20,
  },
  storiesScrollContainer: {
    paddingHorizontal: 10,
  },
  storyContainer: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  storyCircle: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  storyBorder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    padding: 3,
  },
  viewedBorder: {
    borderColor: "#CCCCCC",
  },
  gradientBorder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    padding: 3,
  },
  gradientInner: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    backgroundColor: "white",
    padding: 3,
  },
  storyImageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
  },
  storyInitial: {
    fontFamily: "Gabarito-ExtraBold",
    color: "white",
    fontSize: 24,
  },
  storyTitle: {
    fontFamily: "Gabarito-Regular",
    fontSize: 12,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalBackgroundTouch: {
    flex: 1,
  },
  storyCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SCREEN_HEIGHT * 0.7,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardIcon: {
    fontSize: 24,
    fontFamily: "Gabarito-ExtraBold",
    color: "white",
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: "Gabarito-ExtraBold",
    color: "white",
  },
  cardContent: {
    paddingHorizontal: 20,
  },
  progressSection: {
    marginBottom: 10,
  },
  progressText: {
    fontFamily: "Gabarito-Regular",
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressPercentage: {
    fontFamily: "Gabarito-Regular",
    fontSize: 14,
    color: "#888",
  },
  tasksTitle: {
    fontFamily: "Gabarito-ExtraBold",
    fontSize: 20,
    marginBottom: 10,
    color: "#333",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkmark: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  taskText: {
    fontFamily: "Gabarito-Regular",
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
});
