import * as functions from "firebase-functions";

export const getGoalBreakdown = functions.https.onCall(async (data: any) => {
  console.log("data:", data.data);

  const aiResponse = ["This is a test response from the AI.", "step 2"];

  const result = {
    message: "Successfully called AI goal breakdown function! (Updated)",
    aiGeneratedPlan: aiResponse, // Uncomment and use when you have AI logic
  };

  console.log("Returning result:", result); // Log the actual result being returned
  return result;
});
