import { useEffect } from "react";
import CalendarStrip from "react-native-calendar-strip";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function Calender() {
  const entranceAnimation = useSharedValue(0);
  const entranceAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity: entranceAnimation.value,
    };
  });
  useEffect(() => {
    entranceAnimation.value = withTiming(1, { duration: 1500 });
  }, []);

  return (
    <Animated.View
      style={[
        entranceAnimationStyle,
        {
          borderBottomWidth: 1,
          borderBottomColor: "#e0e0e0",
          paddingBottom: 10,
          paddingHorizontal: 0,
        },
      ]}
    >
      <CalendarStrip
        scrollable
        showMonth={false}
        style={{
          height: 60,
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: "#ffffff",
        }}
        calendarColor={"#ffffff"}
        dateNumberStyle={{
          fontFamily: "Gabarito-ExtraBold",
          color: "#e0e0e0",
          fontSize: 14,
        }}
        dateNameStyle={{
          fontFamily: "Gabarito-Bold",
          color: "#e0e0e0",
          fontSize: 12,
        }}
        highlightDateNumberStyle={{
          fontFamily: "Gabarito-ExtraBold",
          color: "#000000",
          fontSize: 16,
        }}
        highlightDateNameStyle={{
          fontFamily: "Gabarito-Bold",
          color: "#000000",
          fontSize: 14,
        }}
        highlightDateContainerStyle={{
          borderColor: "#e0e0e0",
          borderWidth: 1,
          borderRadius: 10,
          paddingHorizontal: 4,
          paddingVertical: 2,
        }}
        selectedDate={new Date()}
        iconContainer={{ display: "none" }}
        iconLeft={null}
        iconRight={null}
        onDateSelected={(date) => {
          console.log("Selected date:", date);
        }}
      />
    </Animated.View>
  );
}
