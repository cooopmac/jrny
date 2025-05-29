import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function JourneyDetailScreen() {
  const { id } = useLocalSearchParams();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Journey Detail Screen for ID: {id}</Text>
    </View>
  );
}
