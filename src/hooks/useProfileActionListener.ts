import { useEffect } from "react";

/**
 * Listens for `lansa:profile-action` CustomEvents dispatched by ProfileActionRouter
 * and runs `handler()` when the event's `detail.key` matches `key`.
 * Lets each editor self-handle its own deep-link without prop drilling.
 */
export function useProfileActionListener(key: string, handler: () => void) {
  useEffect(() => {
    const onAction = (e: Event) => {
      const detail = (e as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === key) handler();
    };
    window.addEventListener("lansa:profile-action", onAction as EventListener);
    return () => window.removeEventListener("lansa:profile-action", onAction as EventListener);
  }, [key, handler]);
}