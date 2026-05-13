import { useState, useCallback } from "react";
import { AccessGate } from "@/components/for-business/AccessGate";
import { PresentationShell } from "@/components/for-business/PresentationShell";
import { SEOHead } from "@/components/SEOHead";

export default function ForBusiness() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("lansa-b2b-unlocked") === "true"
  );

  const handleUnlock = useCallback(() => setUnlocked(true), []);

  if (!unlocked) {
    return (
      <>
        <SEOHead
          title="Lansa for Business — Hire Certified Caribbean Talent"
          description="Discover certified, work-ready professionals in Curaçao with Lansa's hiring platform built for Caribbean employers."
          canonical="https://www.lansa.online/for-business"
        />
        <AccessGate onUnlock={handleUnlock} />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Lansa for Business — Hire Certified Caribbean Talent"
        description="Discover certified, work-ready professionals in Curaçao with Lansa's hiring platform built for Caribbean employers."
        canonical="https://www.lansa.online/for-business"
      />
      <PresentationShell />
    </>
  );
}
