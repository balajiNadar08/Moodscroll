import AsyncStorage from "@react-native-async-storage/async-storage";

const CURRENT_STREAK_KEY = "currentStreak";
const PERSONAL_BEST_KEY = "personalBest";
const LAST_OPEN_KEY = "lastOpenDate";

export async function updateStreak() {
  try {
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

    const lastOpenDate = await AsyncStorage.getItem(LAST_OPEN_KEY);
    let currentStreak = Number(
      (await AsyncStorage.getItem(CURRENT_STREAK_KEY)) || 0
    );
    let personalBest = Number(
      (await AsyncStorage.getItem(PERSONAL_BEST_KEY)) || 0
    );

    if (!lastOpenDate) {
      currentStreak = 1;
      personalBest = 1;
    }

    else if (lastOpenDate === today) {
      return {
        currentStreak,
        personalBest,
      };
    }

    else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayStr = yesterday.toLocaleDateString("en-CA");

      if (lastOpenDate === yesterdayStr) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }

      personalBest = Math.max(personalBest, currentStreak);
    }

    await AsyncStorage.multiSet([
      [CURRENT_STREAK_KEY, currentStreak.toString()],
      [PERSONAL_BEST_KEY, personalBest.toString()],
      [LAST_OPEN_KEY, today],
    ]);

    return {
      currentStreak,
      personalBest,
    };
  } catch (error) {
    console.error("Streak update failed:", error);

    return {
      currentStreak: 0,
      personalBest: 0,
    };
  }
}

export async function getStreak() {
  return {
    currentStreak: Number(
      (await AsyncStorage.getItem(CURRENT_STREAK_KEY)) || 0
    ),
    personalBest: Number(
      (await AsyncStorage.getItem(PERSONAL_BEST_KEY)) || 0
    ),
  };
}