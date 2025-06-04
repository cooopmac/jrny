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
  const apiKey = process.env.OPENAI_API_KEY;
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
    console.log("Received journey data for AI plan:", data.data.title);

    // Cast data to JourneyData for type safety within the function if desired, or use directly
    const journeyDetails = data.data as JourneyData;

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

Additionally, provide 3 concise, actionable tasks that should be done daily to support this goal.

Return the entire response as a single JSON object with two keys:
1. "plan": An array of strings, where each string is a step in the overall action plan.
2. "dailyTasks": An array of strings, where each string is one of the three daily tasks.

Example:
{
  "plan": ["Research best bench press techniques.", "Find a spotter.", "Start with lighter weights."],
  "dailyTasks": ["Do 50 push-ups.", "Stretch chest and shoulders.", "Eat a high-protein meal."]
}

Do not include any other text or explanation outside of this JSON object.`;

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
          const parsedResponse = JSON.parse(aiMessage);

          // Validate the structure of the parsed response
          const plan = parsedResponse.plan;
          const dailyTasks = parsedResponse.dailyTasks;

          if (
            Array.isArray(plan) &&
            plan.every((item) => typeof item === "string") &&
            Array.isArray(dailyTasks) &&
            dailyTasks.every((item) => typeof item === "string")
          ) {
            console.log("Successfully parsed AI plan and daily tasks:", {
              plan,
              dailyTasks,
            });
            return {
              message: "AI action plan and daily tasks generated successfully.",
              receivedData: journeyDetails,
              aiGeneratedPlan: plan,
              dailyTasks: dailyTasks,
            };
          } else {
            console.warn(
              "OpenAI response was not a valid JSON object with 'plan' and 'dailyTasks' arrays of strings:",
              aiMessage
            );
            // Fallback if structure is not as expected but we got some message
            // This fallback is very basic and might need improvement based on actual AI responses when it fails
            return {
              message:
                "AI response format was not as expected. Raw response logged.",
              aiGeneratedPlan: [aiMessage], // Return raw message as a single step plan
              dailyTasks: [],
              receivedData: journeyDetails,
            };
          }
        } catch (parseError) {
          console.error(
            "Error parsing AI response. It might not be valid JSON:",
            parseError
          );
          console.error("AI Message Content that failed parsing:", aiMessage);
          // Fallback for JSON parsing error
          return {
            message:
              "AI plan generated, but there was an issue parsing it. Raw response logged.",
            aiGeneratedPlan: [
              "Could not parse AI response. Check logs.",
              aiMessage,
            ],
            dailyTasks: [],
            receivedData: journeyDetails,
          };
        }
      } else {
        console.warn("OpenAI response was empty.");
        return {
          message: "AI did not return a plan.",
          aiGeneratedPlan: [],
          dailyTasks: [],
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
        dailyTasks: [], // Ensure dailyTasks is included in error returns
        receivedData: journeyDetails,
      };
    }
  }
);
