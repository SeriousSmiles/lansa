import { ShieldCheck } from "lucide-react";
import { TileShell } from "./TileShell";
import { CertificationCard } from "@/components/dashboard/overview/CertificationCard";

export function CertificationTile() {
  return (
    <TileShell label="Visibility" title="Certification" icon={ShieldCheck}>
      <div className="-mx-1">
        <CertificationCard />
      </div>
    </TileShell>
  );
}