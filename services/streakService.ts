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

    if (lastLoginDateString === todayString) {
      console.log("Streak Service: Already logged in today. Streak unchanged.");
      return;
    }

    // If there was a last login, check if it was yesterday
    if (lastLoginDateString) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split("T")[0];

      if (lastLoginDateString === yesterdayString) {
        currentStreak++;
        console.log(
          "Streak Service: Consecutive day! New streak:",
          currentStreak
        );
      } else {
        // Not yesterday, so the streak is broken
        currentStreak = 1;
        console.log("Streak Service: Streak broken. Reset to 1.");
      }
    } else {
      // No last login date means this is the first login
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
