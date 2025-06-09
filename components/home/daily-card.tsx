import { StyleSheet, Text, View } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";

export default function Card() {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.headerText}>daily goals.</Text>
        <Text style={styles.text}>continue to complete your journey.</Text>
      </View>
      <View style={styles.progressContainer}>
        <CircularProgress
          value={50}
          valueSuffix="%"
          radius={40}
          maxValue={100}
          inActiveStrokeColor="white"
          inActiveStrokeOpacity={1}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "black",
    marginHorizontal: 20,
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 20,
  },
  headerText: {
    fontSize: 24,
    fontFamily: "Gabarito-ExtraBold",
    color: "white",
  },
  text: {
    fontSize: 14,
    fontFamily: "Gabarito-Regular",
    color: "white",
  },
  progressContainer: {
    justifyContent: "center",
  },
});
