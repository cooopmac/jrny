// AsyncStorage utility functions
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, StorageKey } from "../constants/storage";

/**
 * Get a string value from AsyncStorage
 * @param key - The storage key
 * @returns Promise<string | null>
 */
export const getStorageString = async (
  key: StorageKey
): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to get storage item for key ${key}:`, error);
    return null;
  }
};

/**
 * Set a string value in AsyncStorage
 * @param key - The storage key
 * @param value - The value to store
 * @returns Promise<boolean> - Success status
 */
export const setStorageString = async (
  key: StorageKey,
  value: string
): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Failed to set storage item for key ${key}:`, error);
    return false;
  }
};

/**
 * Get a JSON object from AsyncStorage
 * @param key - The storage key
 * @returns Promise<T | null>
 */
export const getStorageObject = async <T = any>(
  key: StorageKey
): Promise<T | null> => {
  try {
    const jsonString = await AsyncStorage.getItem(key);
    return jsonString ? JSON.parse(jsonString) : null;
  } catch (error) {
    console.error(`Failed to get/parse storage object for key ${key}:`, error);
    return null;
  }
};

/**
 * Set a JSON object in AsyncStorage
 * @param key - The storage key
 * @param value - The object to store
 * @returns Promise<boolean> - Success status
 */
export const setStorageObject = async <T = any>(
  key: StorageKey,
  value: T
): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(
      `Failed to set/stringify storage object for key ${key}:`,
      error
    );
    return false;
  }
};

/**
 * Remove an item from AsyncStorage
 * @param key - The storage key
 * @returns Promise<boolean> - Success status
 */
export const removeStorageItem = async (key: StorageKey): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove storage item for key ${key}:`, error);
    return false;
  }
};

/**
 * Get login streak count from storage
 * @returns Promise<number> - The streak count (0 if not found)
 */
export const getLoginStreak = async (): Promise<number> => {
  try {
    const streakString = await getStorageString(
      STORAGE_KEYS.LOGIN_STREAK_COUNT
    );
    return streakString ? parseInt(streakString, 10) : 0;
  } catch (error) {
    console.error("Failed to fetch login streak:", error);
    return 0;
  }
};

/**
 * Get viewed stories dates from storage
 * @returns Promise<{ [key: string]: string } | null>
 */
export const getViewedStoriesDates = async (): Promise<{
  [key: string]: string;
} | null> => {
  return await getStorageObject<{ [key: string]: string }>(
    STORAGE_KEYS.VIEWED_STORIES_DATES
  );
};
