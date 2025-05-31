import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys for AsyncStorage
export const LAST_LOGIN_DATE_KEY = "@App:lastLoginDate";
export const LOGIN_STREAK_COUNT_KEY = "@App:loginStreakCount";
export const ACTIVE_DATES_KEY = "@App:activeDates";

export async function updateLoginStreak() {
  try {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD format

    const lastLoginDateString = await AsyncStorage.getItem(LAST_LOGIN_DATE_KEY);
    const streakCountString = await AsyncStorage.getItem(
      LOGIN_STREAK_COUNT_KEY
    );

    let currentStreak = streakCountString ? parseInt(streakCountString, 10) : 0;

    if (lastLoginDateString) {
      if (lastLoginDateString === todayString) {
        console.log(
          "Streak Service: Already logged in today. Streak unchanged."
        );
        return;
      }

      const lastLoginDate = new Date(lastLoginDateString);
      const differenceInTime = today.getTime() - lastLoginDate.getTime();
      const differenceInDays = Math.floor(
        differenceInTime / (1000 * 3600 * 24)
      );

      if (differenceInDays === 1) {
        currentStreak++;
        console.log(
          "Streak Service: Consecutive day! New streak:",
          currentStreak
        );
      } else {
        currentStreak = 1;
        console.log(
          "Streak Service: Streak broken or first login. Reset to 1."
        );
      }
    } else {
      currentStreak = 1;
      console.log("Streak Service: First login. Streak set to 1.");
    }

    await AsyncStorage.setItem(LAST_LOGIN_DATE_KEY, todayString);
    await AsyncStorage.setItem(
      LOGIN_STREAK_COUNT_KEY,
      currentStreak.toString()
    );
  } catch (error) {
    console.error("Streak Service: Failed to update login streak:", error);
  }
}
