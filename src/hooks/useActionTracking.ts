
import { useCallback } from "react";
import { trackUserAction, ActionType, ActionMetadata } from "@/services/actionTracking";
import { useAuth } from "@/contexts/AuthContext";

export function useActionTracking() {
  const { user } = useAuth();
  
  const track = useCallback(async (actionType: ActionType, metadata: ActionMetadata = {}) => {
    await trackUserAction(actionType, metadata);
  }, []);

  return { track };
}
