import { Sparkles } from "lucide-react";
import { TileShell } from "./TileShell";
import { AICareerPlanCard } from "@/components/dashboard/overview/AICareerPlanCard";

interface CareerPlanTileProps {
  autoOpen?: boolean;
}

export function CareerPlanTile({ autoOpen }: CareerPlanTileProps) {
  return (
    <TileShell label="Workspace" title="Career plan" icon={Sparkles}>
      <div className="-mx-1">
        <AICareerPlanCard autoOpen={autoOpen} />
      </div>
    </TileShell>
  );
}