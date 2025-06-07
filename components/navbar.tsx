// components/CustomTabBar.js
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
} from "react-native-reanimated";
import { useEffect, useState } from "react";

export default function Navbar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [containerWidth, setContainerWidth] = useState(0);
  const animatedValue = useSharedValue(0);
  const entranceAnimation = useSharedValue(0);

  // Constants
  const numberOfTabs = state.routes.length;
  const INDICATOR_WIDTH_RATIO = 0.6; // 60% of tab width
  const CONTAINER_HORIZONTAL_PADDING = 50;

  // Calculate actual tab width (accounting for padding)
  const availableWidth = containerWidth - CONTAINER_HORIZONTAL_PADDING * 2;
  const tabWidth = availableWidth / numberOfTabs;

  // Update animation when the selected tab changes
  useEffect(() => {
    animatedValue.value = withSpring(state.index, {
      damping: 15,
      stiffness: 150,
    });
    entranceAnimation.value = withDelay(
      300,
      withSpring(1, { damping: 15, stiffness: 100 })
    );
  }, [state.index]);

  const animatedEntranceStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(entranceAnimation.value, [0, 1], [100, 0]) },
      ],
    };
  });

  // Animated style for the tab indicator
  const animatedTabIndicatorStyle = useAnimatedStyle(() => {
    if (tabWidth === 0) return { opacity: 0 };

    // Calculate the indicator width
    const indicatorWidth = tabWidth * INDICATOR_WIDTH_RATIO;

    // Calculate where to position the indicator for each tab
    // Start position is the padding, then add tab positions
    const tabPositions = state.routes.map((_: any, i: any) => {
      const tabStart = CONTAINER_HORIZONTAL_PADDING + i * tabWidth;
      const tabCenter = tabStart + tabWidth / 2;
      const indicatorPosition = tabCenter - indicatorWidth / 2;
      return indicatorPosition;
    });

    // Interpolate between positions
    const translateX = interpolate(
      animatedValue.value,
      state.routes.map((_: any, i: any) => i),
      tabPositions
    );

    return {
      transform: [{ translateX }],
      opacity: 1,
    };
  });

  const onLayoutHandler = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingBottom: insets.bottom },
        animatedEntranceStyle,
      ]}
      onLayout={onLayoutHandler}
    >
      {/* Animated tab indicator */}
      <Animated.View
        style={[
          styles.tabIndicator,
          { width: tabWidth * INDICATOR_WIDTH_RATIO },
          animatedTabIndicatorStyle,
        ]}
      />

      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tab}
          >
            <Text style={[styles.label, isFocused && styles.labelFocused]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 10,
    paddingHorizontal: 50,
    position: "relative",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    fontFamily: "Gabarito-Bold",
    color: "#666",
  },
  labelFocused: {
    color: "#000000",
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    top: 0,
    height: 3,
    backgroundColor: "#000000",
    borderRadius: 1.5,
  },
});
