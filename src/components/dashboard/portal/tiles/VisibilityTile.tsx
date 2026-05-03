import { Eye } from "lucide-react";
import { TileShell } from "./TileShell";
import { ListingActivationCard } from "@/components/dashboard/overview/ListingActivationCard";
import { WhoIsInterestedSection } from "@/components/dashboard/WhoIsInterestedSection";

export function VisibilityTile() {
  return (
    <TileShell label="Visibility" title="Who's interested" icon={Eye}>
      <div className="space-y-4 -mx-1">
        <ListingActivationCard />
        <WhoIsInterestedSection />
      </div>
    </TileShell>
  );
}