import { getFunctions, httpsCallable } from "firebase/functions";

// Define the data structure sent to the Firebase function
export interface AIGoalBreakdownRequestData {
  title: string;
  description?: string;
  priority?: string; // Assuming 'Low', 'Medium', 'High' or similar
  lengthOfTime?: string; // e.g., "1 week", "3 months"
  // targetSteps?: number; // Optional: if you want to suggest a number of steps
}

// Define the expected structure of a single step in the AI plan
export interface AIPlanStep {
  text: string;
  completed: boolean; // Will always be false initially from AI
}

// Define the expected response type from the Firebase function
export interface AIGoalBreakdownResponse {
  message: string; // General message from the function
  receivedData?: AIGoalBreakdownRequestData; // Echo back what was sent
  aiGeneratedPlan?: AIPlanStep[]; // This is what we want
  // If your Firebase function still returns string[], we'll convert it
  // or, ideally, update the Firebase function to return AIPlanStep[]
}

// Initialize Firebase functions
const functions = getFunctions();

/**
 * Calls the Firebase function to get the AI goal breakdown.
 * @param data - The data to pass to the Firebase function.
 * @returns A promise that resolves with the result of the Firebase function.
 */
export const getAIGoalBreakdown = async (
  data: AIGoalBreakdownRequestData
): Promise<AIGoalBreakdownResponse> => {
  try {
    const callFirebaseFunction = httpsCallable(functions, "getGoalBreakdown");
    const result = await callFirebaseFunction(data);
    console.log(
      "[aiService] Raw data from Firebase function:",
      JSON.stringify(result.data, null, 2)
    ); // Log the raw data

    const responseData = result.data as any; // Cast to any first for transformation

    // IMPORTANT: Transform if Firebase returns string[]
    // If your Firebase function `getGoalBreakdown` returns `aiGeneratedPlan` as string[],
    // we need to transform it here.
    // If it already returns Array<{ text: string; completed: boolean }>, this part can be simpler.
    let structuredPlan: AIPlanStep[] | undefined = undefined;
    if (
      responseData.aiGeneratedPlan &&
      Array.isArray(responseData.aiGeneratedPlan)
    ) {
      if (
        responseData.aiGeneratedPlan.length > 0 &&
        typeof responseData.aiGeneratedPlan[0] === "string"
      ) {
        // Looks like string[], needs transformation
        structuredPlan = responseData.aiGeneratedPlan.map(
          (stepText: string) => ({
            text: stepText,
            completed: false,
          })
        );
      } else if (
        responseData.aiGeneratedPlan.length > 0 &&
        typeof responseData.aiGeneratedPlan[0] === "object" &&
        "text" in responseData.aiGeneratedPlan[0] &&
        "completed" in responseData.aiGeneratedPlan[0]
      ) {
        // Looks like it's already in the desired AIPlanStep[] structure
        structuredPlan = responseData.aiGeneratedPlan;
      }
    }

    return {
      message: responseData.message,
      receivedData: responseData.receivedData,
      aiGeneratedPlan: structuredPlan,
    } as AIGoalBreakdownResponse;
  } catch (error) {
    console.error(
      "[aiService] Error calling Firebase function 'getGoalBreakdown':",
      error
    );
    // Consider re-throwing a more specific error or handling it
    throw new Error(
      `Failed to get AI goal breakdown: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
