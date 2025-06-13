export interface Journey {
  id: number; // Supabase uses number for IDs
  title: string;
  description: string;
  status: "Planned" | "Active" | "Completed";
  progress: number;
  user_id: string; // Supabase uses snake_case
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  length_of_time?: string;
  priority?: "Low" | "Medium" | "High";
  end_date?: string; // ISO date string
  ai_generated_plan?: Array<{ text: string; completed: boolean }>;
  daily_tasks?: string[]; // Daily recurring tasks
  category: string;
  color: string;
}

// Interface for the journey as it's displayed in the UI
export interface JourneyDisplay {
  id: number;
  title: string;
  description: string;
  status: "Planned" | "Active" | "Completed";
  progress: number;
  category: string;
  color: string;
  priority?: "Low" | "Medium" | "High";
  lengthOfTime?: string;
  endDate?: string;
  dailyTasks?: string[];
  aiGeneratedPlan?: Array<{ text: string; completed: boolean }>;
}
