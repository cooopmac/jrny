import Card from "@/components/home/daily-card";
import DailyStories from "@/components/home/daily-stories";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Calender from "../../components/home/calender";
import Header from "../../components/home/header";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <Calender />
      <DailyStories />
      <Card />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
