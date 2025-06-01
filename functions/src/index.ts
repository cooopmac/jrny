import * as functions from "firebase-functions";

export const getGoalBreakdown = functions.https.onCall(
  async (data: any, context) => {
    console.log("Received data (full object passed to onCall):");
    console.log("Type of data received:", typeof data);
    if (typeof data === "object" && data !== null) {
      console.log("Keys in received data object:", Object.keys(data));
      if (data.hasOwnProperty("data")) {
        console.log(
          "Value of received_data.data (nested property):",
          data.data
        );
      }
    }

    const aiResponse = ["This is a test response from the AI.", "step 2"];

    const result = {
      message: "Successfully called AI goal breakdown function! (Updated)",
      aiGeneratedPlan: aiResponse, // Uncomment and use when you have AI logic
    };

    console.log("Returning result:", result); // Log the actual result being returned
    return result;
  }
);
