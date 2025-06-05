// AsyncStorage key constants
export const STORAGE_KEYS = {
  LOGIN_STREAK_COUNT: "@App:loginStreakCount",
  VIEWED_STORIES_DATES: "@App:viewedStoriesDates",
} as const;

// Type for storage keys to ensure type safety
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
