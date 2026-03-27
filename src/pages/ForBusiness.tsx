import { useState, useCallback } from "react";
import { AccessGate } from "@/components/for-business/AccessGate";
import { PresentationShell } from "@/components/for-business/PresentationShell";

export default function ForBusiness() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("lansa-b2b-unlocked") === "true"
  );

  const handleUnlock = useCallback(() => setUnlocked(true), []);

  if (!unlocked) {
    return <AccessGate onUnlock={handleUnlock} />;
  }

  return <PresentationShell />;
}
