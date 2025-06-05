// Date utility functions

/**
 * Get the current day of the week as a lowercase string with period
 * @returns string - e.g., "monday.", "tuesday.", etc.
 */
export const getDate = (): string => {
  const days = [
    "sunday.",
    "monday.",
    "tuesday.",
    "wednesday.",
    "thursday.",
    "friday.",
    "saturday.",
  ];

  const date = new Date();
  const day = date.getDay();
  return days[day];
};

/**
 * Get today's date as YYYY-MM-DD string
 * @returns string - e.g., "2024-01-15"
 */
export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Format Firestore timestamp to readable date string
 * @param timestamp - Firestore timestamp object
 * @returns string - formatted date or "N/A"
 */
export const formatFirestoreDate = (timestamp: any): string => {
  if (!timestamp || !timestamp.seconds) return "N/A";
  return new Date(timestamp.seconds * 1000).toLocaleDateString();
};
