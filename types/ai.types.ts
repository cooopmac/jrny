// AI service related types and interfaces

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
  dailyTasks?: string[]; // Added for daily tasks
  // If your Firebase function still returns string[], we'll convert it
  // or, ideally, update the Firebase function to return AIPlanStep[]
}
