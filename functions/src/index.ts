import * as functions from "firebase-functions";

export const getGoalBreakdown = functions.https.onCall(
  async (data: any, context) => {
    // Log the incoming data
    console.log("Received data (full object passed to onCall):");
    // Be careful with logging the full 'data' if it's huge or circular
    // console.log(JSON.stringify(data, null, 2)); // This might fail too if data is circular
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

    // Optional: Check if the user is authenticated
    // if (!context.auth) {
    //   throw new functions.https.HttpsError(
    //     "unauthenticated",
    //     "The function must be called while authenticated."
    //   );
    // }

    // --- Your AI logic goes here (currently commented out) ---
    // const aiResponse = await callSomeAIService(data.prompt);

    // If 'data' is the complex wrapper { rawRequest: ..., data: 'payload' },
    // then 'data.data' should be the 'payload' part.
    // If 'data' is already the simple client payload, this might be undefined or error
    // but based on logs, 'data' is the complex wrapper.
    let dataToReturn = "Error: Could not extract specific data field.";
    if (
      typeof data === "object" &&
      data !== null &&
      data.hasOwnProperty("data")
    ) {
      dataToReturn = data.data; // Assuming data.data is the serializable part, e.g., 'drive'
    } else {
      // If data is not the expected wrapper, or is primitive, log and return it directly if safe
      console.log(
        "Data received by onCall was not the expected wrapper object. It was:",
        data
      );
      dataToReturn = data; // This might still be problematic if 'data' is complex but not the wrapper
      // But for a primitive, it's fine.
    }

    const result = {
      message: "Successfully called AI goal breakdown function! (Updated)",
      receivedData: dataToReturn,
      // aiGeneratedBreakdown: aiResponse, // Uncomment and use when you have AI logic
    };

    console.log("Returning result:", result); // Log the actual result being returned
    return result;
  }
);
