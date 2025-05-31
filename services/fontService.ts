import * as Font from "expo-font";

export async function loadApplicationFonts() {
  try {
    await Font.loadAsync({
      "Gabarito-SemiBold": require("../assets/fonts/Gabarito-SemiBold.ttf"),
      "Gabarito-Regular": require("../assets/fonts/Gabarito-Regular.ttf"),
      "Gabarito-Medium": require("../assets/fonts/Gabarito-Medium.ttf"),
      "Gabarito-ExtraBold": require("../assets/fonts/Gabarito-ExtraBold.ttf"),
      "Gabarito-Bold": require("../assets/fonts/Gabarito-Bold.ttf"),
      "Gabarito-Black": require("../assets/fonts/Gabarito-Black.ttf"),
    });
    console.log("Fonts loaded successfully.");
  } catch (e) {
    console.warn("Error loading application fonts:", e);
    // Optionally re-throw or handle as needed, for now, just log
  }
}
