import { getFunctions, httpsCallable } from "firebase/functions";

// Define the expected response type from the Firebase function
export interface AIGoalBreakdownResponse {
  message: string;
  receivedData?: any; // Make receivedData optional as it's for testing
  aiGeneratedPlan?: string[]; // Field for the AI generated plan steps
  // Later, you'll add your actual AI breakdown fields here, e.g.:
  // aiGeneratedBreakdown?: string[];
}

// Initialize Firebase functions
const functions = getFunctions();

/**
 * Calls the Firebase function to get the AI goal breakdown.
 * @param data - The data to pass to the Firebase function.
 * @returns A promise that resolves with the result of the Firebase function.
 */
export const getAIGoalBreakdown = async (
  data: any
): Promise<AIGoalBreakdownResponse> => {
  try {
    const callFirebaseFunction = httpsCallable(functions, "getGoalBreakdown");
    const result = await callFirebaseFunction(data);
    return result.data as AIGoalBreakdownResponse;
  } catch (error) {
    console.error("Error calling Firebase function:", error);
    throw error;
  }
};
