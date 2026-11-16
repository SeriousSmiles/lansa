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
          title="Hire Certified Talent in Curaçao | Lansa for Business"
          description="Post jobs and hire certified, work-ready professionals in Curaçao. Lansa helps local employers find, review and connect with verified candidates fast."
          canonical="https://lansa.online/for-business"
        />
        <AccessGate onUnlock={handleUnlock} />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Hire Certified Talent in Curaçao | Lansa for Business"
        description="Post jobs and hire certified, work-ready professionals in Curaçao. Lansa helps local employers find, review and connect with verified candidates fast."
        canonical="https://lansa.online/for-business"
      />
      <PresentationShell />
    </>
  );
}
