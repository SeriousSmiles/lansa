
import { useCallback } from "react";
import { trackUserAction, ActionType, ActionMetadata } from "@/services/actionTracking";
import { checkAndRemoveCompletedInsights } from "@/services/aiInsights";
import { useUser } from "@clerk/clerk-react";

export function useActionTracking() {
  const { user } = useUser();
  
  const track = useCallback(async (actionType: ActionType, metadata: ActionMetadata = {}) => {
    await trackUserAction(actionType, metadata);
    
    // After tracking an action, check if any insights should be removed
    if (user?.id) {
      setTimeout(() => {
        checkAndRemoveCompletedInsights(user.id);
      }, 1000); // Small delay to ensure the action is properly recorded
    }
  }, [user?.id]);

  return { track };
}
