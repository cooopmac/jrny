// Journey-related types and interfaces
export interface Journey {
  id: string; // Firestore document ID
  title: string;
  description: string;
  status: "Planned" | "Active" | "Completed";
  progress?: number;
  userId: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  lengthOfTime?: string;
  priority?: "Low" | "Medium" | "High";
  endDate?: any; // Firestore Timestamp or Date object
  aiGeneratedPlan?: Array<{ text: string; completed: boolean }>;
  dailyTasks?: string[]; // Daily recurring tasks
}

export type JourneyStatus = "Planned" | "Active" | "Completed";
export type JourneyPriority = "Low" | "Medium" | "High";

export interface JourneyFormData {
  title: string;
  description?: string;
  lengthOfTime?: string;
  priority?: JourneyPriority;
  endDate?: Date;
}

export interface JourneyStep {
  text: string;
  completed: boolean;
}
