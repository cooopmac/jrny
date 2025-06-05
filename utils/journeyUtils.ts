// Journey utility functions
import { Journey, JourneyStep } from "../types";

/**
 * Handle old and new plan structures for backward compatibility
 * @param plan - The plan array from Firestore
 * @returns Array of structured plan steps
 */
export const getStructuredPlan = (plan: any): JourneyStep[] => {
  if (!plan || plan.length === 0) return [];

  if (typeof plan[0] === "string") {
    // Old format: string[], convert to new format
    return plan.map((stepText: string) => ({
      text: stepText,
      completed: false,
    }));
  }

  // Already new format or unhandled: return as is (or add more robust checks)
  return plan;
};

/**
 * Calculate progress percentage based on completed steps
 * @param plan - Array of journey steps
 * @returns Progress percentage (0-100)
 */
export const calculateProgress = (plan: JourneyStep[]): number => {
  if (!plan || plan.length === 0) return 0;

  const completedSteps = plan.filter((step) => step.completed).length;
  const totalSteps = plan.length;

  return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
};

/**
 * Get the next uncompleted step from a journey plan
 * @param plan - Array of journey steps
 * @returns The next uncompleted step or null
 */
export const getNextUncompletedStep = (
  plan?: JourneyStep[]
): JourneyStep | null => {
  if (!plan || plan.length === 0) return null;

  return plan.find((step) => !step.completed) || null;
};

/**
 * Get the first step from a journey plan
 * @param plan - Array of journey steps
 * @returns The first step or null
 */
export const getFirstStep = (plan?: JourneyStep[]): JourneyStep | null => {
  if (!plan || plan.length === 0) return null;

  return plan[0] || null;
};

/**
 * Determine the appropriate status based on completed steps
 * @param currentStatus - Current journey status
 * @param completedSteps - Number of completed steps
 * @param totalSteps - Total number of steps
 * @returns New status if it should change, otherwise current status
 */
export const determineJourneyStatus = (
  currentStatus: Journey["status"],
  completedSteps: number,
  totalSteps: number
): Journey["status"] => {
  if (currentStatus === "Planned" && completedSteps > 0) {
    return "Active";
  } else if (
    currentStatus === "Active" &&
    completedSteps === 0 &&
    totalSteps > 0
  ) {
    return "Planned";
  }

  return currentStatus;
};
