import * as functions from "firebase-functions";
import OpenAI from "openai"; // Import the OpenAI library

// Define the expected input data structure from the client
interface JourneyData {
  title: string;
  description?: string;
  priority?: string;
  lengthOfTime?: string;
}

// Initialize OpenAI client
// The API key will be loaded from Firebase Functions configuration
let openai: OpenAI | null = null;
try {
  const apiKey = functions.config().openai?.key;
  if (!apiKey) {
    console.error(
      "OpenAI API key not found in Firebase Functions config (using functions.config().openai.key). " +
        "Set it using 'firebase functions:config:set openai.key=\"YOUR_KEY\"'"
    );
  } else {
    openai = new OpenAI({ apiKey });
  }
} catch (error) {
  console.error("Error initializing OpenAI client:", error);
}

export const getGoalBreakdown = functions.https.onCall(
  async (data: any, context: any) => {
    // Log the received data (it's directly in 'data', not 'data.data' for onCall)
    console.log("Received journey data for AI plan:", data);

    // Cast data to JourneyData for type safety within the function if desired, or use directly
    const journeyDetails = data as JourneyData;

    if (!openai) {
      console.error("OpenAI client is not initialized. Cannot generate plan.");
      // Consider throwing an error or returning a specific message
      return {
        message: "AI service is not configured correctly. Missing API key.",
        aiGeneratedPlan: [],
      };
    }

    if (!journeyDetails || !journeyDetails.title) {
      console.error("Title is missing in the request data.");
      return {
        message: "Journey title is required to generate an AI plan.",
        aiGeneratedPlan: [],
      };
    }

    // Construct the prompt for OpenAI using journeyDetails
    let promptContent = `Generate a step-by-step action plan to achieve the following goal.
Goal Title: ${journeyDetails.title}`;
    if (journeyDetails.description) {
      promptContent += `\nDescription: ${journeyDetails.description}`;
    }
    if (journeyDetails.priority) {
      promptContent += `\nPriority: ${journeyDetails.priority}`;
    }
    if (journeyDetails.lengthOfTime) {
      promptContent += `\nDesired Duration: ${journeyDetails.lengthOfTime}`;
    }
    promptContent += `

Return the plan as a JSON array of strings, where each string is a concise, actionable step. For example: ["First step description.", "Second step description."]. Do not include any other text or explanation outside of this JSON array.`;

    try {
      console.log("Sending prompt to OpenAI:", promptContent);
      const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: promptContent }],
        model: "gpt-3.5-turbo", // Or "gpt-4" or other models you prefer
        // You can add temperature, max_tokens etc. if needed
      });

      const aiMessage = chatCompletion.choices[0]?.message?.content;
      console.log("Raw response from OpenAI:", aiMessage);

      if (aiMessage) {
        try {
          // Attempt to parse the response as JSON
          const parsedPlan = JSON.parse(aiMessage);
          if (
            Array.isArray(parsedPlan) &&
            parsedPlan.every((item) => typeof item === "string")
          ) {
            console.log("Successfully parsed AI plan:", parsedPlan);
            return {
              message: "AI action plan generated successfully.",
              receivedData: journeyDetails, // Echo back the received data
              aiGeneratedPlan: parsedPlan,
            };
          } else {
            console.warn(
              "OpenAI response was not a valid JSON array of strings:",
              aiMessage
            );
            // Fallback: if it's not JSON, maybe it's a list we can try to split?
            // This is less reliable.
            const fallbackPlan = aiMessage
              .split(/\n(?=\d+\.\s)/) // Split by lines starting with "1. ", "2. " etc.
              .map((step) => step.replace(/^\d+\.\s/, "").trim()) // Remove numbering
              .filter((step) => step.length > 0);

            if (fallbackPlan.length > 0) {
              console.log("Parsed AI plan using fallback:", fallbackPlan);
              return {
                message: "AI action plan generated (fallback parsing).",
                receivedData: journeyDetails,
                aiGeneratedPlan: fallbackPlan,
              };
            }
            throw new Error("AI response format was not as expected.");
          }
        } catch (parseError) {
          console.error(
            "Error parsing AI response. It might not be valid JSON:",
            parseError
          );
          console.error("AI Message Content that failed parsing:", aiMessage);
          // Even if parsing fails, return the raw message if it seems like a plan
          // This is a basic fallback and should be improved if possible
          const fallbackPlan = aiMessage
            .split("\n")
            .map((s) => s.trim())
            .filter(
              (s) =>
                s.length > 0 &&
                !s.toLowerCase().startsWith("sure") &&
                !s.toLowerCase().startsWith("here is")
            );

          if (fallbackPlan.length > 0) {
            console.warn(
              "Returning plan parsed by basic newline split due to JSON parse error."
            );
            return {
              message: "AI action plan generated (raw, parsing issues).",
              receivedData: journeyDetails,
              aiGeneratedPlan: fallbackPlan,
            };
          }
          return {
            message:
              "AI plan generated, but there was an issue parsing it. Raw response logged.",
            aiGeneratedPlan: [
              "Could not parse AI response. Check logs.",
              aiMessage,
            ], // Return the raw message for debugging
            receivedData: journeyDetails,
          };
        }
      } else {
        console.warn("OpenAI response was empty.");
        return {
          message: "AI did not return a plan.",
          aiGeneratedPlan: [],
          receivedData: journeyDetails,
        };
      }
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      let errorMessage = "An unknown error occurred while contacting the AI.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return {
        message: `Error generating AI plan: ${errorMessage}`,
        aiGeneratedPlan: [],
        receivedData: journeyDetails,
      };
    }
  }
);
