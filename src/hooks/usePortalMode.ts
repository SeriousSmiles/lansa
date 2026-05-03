import { useEffect, useState, useCallback } from "react";

const KEY = "lansa.dashboardPortalV2";
const EVENT = "lansa:portal-mode-change";

function read(): boolean {
  if (typeof window === "undefined") return true;
  // Default: portal v2 ON. Opt out with `0`.
  return localStorage.getItem(KEY) !== "0";
}

/**
 * Global preference for the new "Portal v2" experience.
 * Persisted in localStorage under `lansa.dashboardPortalV2`.
 * `0` = legacy classic UI, anything else = new portal.
 *
 * Multiple components on the page stay in sync via a custom window event.
 */
export function usePortalMode() {
  const [portalV2, setPortalV2State] = useState<boolean>(() => read());

  useEffect(() => {
    const onChange = () => setPortalV2State(read());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setPortalV2 = useCallback((next: boolean) => {
    localStorage.setItem(KEY, next ? "1" : "0");
    setPortalV2State(next);
    window.dispatchEvent(new CustomEvent(EVENT));
  }, []);

  const toggle = useCallback(() => {
    setPortalV2(!read());
  }, [setPortalV2]);

  return { portalV2, setPortalV2, toggle };
}

export const PORTAL_MODE_KEY = KEY;