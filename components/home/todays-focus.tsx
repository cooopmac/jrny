import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function TodaysFocus() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      task: "Complete 30-min cardio workout",
      category: "fitness",
      categoryColor: "#f87171",
      completed: false,
    },
    {
      id: 2,
      task: "Read 15 pages of JavaScript book",
      category: "learning",
      categoryColor: "#4ade80",
      completed: true,
    },
    {
      id: 3,
      task: "Review NASA Mars mission timeline",
      category: "nasa",
      categoryColor: "#000000",
      completed: false,
    },
  ]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedCount = tasks.filter((task) => task.completed).length;

  const TaskItem = ({
    task,
    onToggle,
  }: {
    task: any;
    onToggle: () => void;
  }) => {
    const scale = useSharedValue(1);
    const checkboxScale = useSharedValue(task.completed ? 1 : 0.8);
    const opacity = useSharedValue(task.completed ? 0.7 : 1);

    const animatedContainerStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const animatedCheckboxStyle = useAnimatedStyle(() => {
      const backgroundColor = interpolateColor(
        checkboxScale.value,
        [0.8, 1],
        ["transparent", "#22c55e"]
      );

      return {
        transform: [{ scale: checkboxScale.value }],
        backgroundColor,
        borderColor: task.completed ? "#22c55e" : "#d1d5db",
      };
    });

    const animatedTextStyle = useAnimatedStyle(() => ({
      opacity: withTiming(task.completed ? 0.6 : 1, { duration: 300 }),
    }));

    const handlePress = () => {
      // Bounce animation
      scale.value = withSpring(0.95, { damping: 15 }, () => {
        scale.value = withSpring(1);
      });

      // Checkbox animation
      if (!task.completed) {
        checkboxScale.value = withSpring(1.2, { damping: 12 }, () => {
          checkboxScale.value = withSpring(1);
        });
      } else {
        checkboxScale.value = withSpring(0.8);
      }

      // Opacity animation
      opacity.value = withTiming(task.completed ? 1 : 0.7, { duration: 300 });

      onToggle();
    };

    return (
      <AnimatedTouchableOpacity
        style={[styles.taskItem, animatedContainerStyle]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Animated.View style={[styles.checkbox, animatedCheckboxStyle]}>
          {task.completed && <Animated.View style={styles.checkmark} />}
        </Animated.View>

        <Animated.Text
          style={[
            styles.taskText,
            animatedTextStyle,
            task.completed && styles.completedText,
          ]}
        >
          {task.task}
        </Animated.Text>

        <View
          style={[styles.categoryDot, { backgroundColor: task.categoryColor }]}
        />
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>today's focus.</Text>
        <Text style={styles.counter}>
          {completedCount}/{tasks.length}
        </Text>
      </View>

      <View style={styles.taskList}>
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => toggleTask(task.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: "Gabarito-ExtraBold",
    color: "#000000",
  },
  counter: {
    fontSize: 14,
    fontFamily: "Gabarito-Regular",
    color: "#6b7280",
  },
  taskList: {
    gap: 6,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    width: 8,
    height: 8,
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Gabarito-Regular",
    color: "#000000",
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#6b7280",
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});
