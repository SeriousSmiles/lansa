
import { useCallback } from "react";
import { trackUserAction, ActionType, ActionMetadata } from "@/services/actionTracking";

export function useActionTracking() {
  const track = useCallback(async (actionType: ActionType, metadata: ActionMetadata = {}) => {
    await trackUserAction(actionType, metadata);
  }, []);

  return { track };
}
