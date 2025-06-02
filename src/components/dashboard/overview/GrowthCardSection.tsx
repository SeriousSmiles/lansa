
import { GrowthCardWidget } from "@/components/growth/GrowthCardWidget";

interface GrowthCardSectionProps {
  userId: string | undefined;
}

export function GrowthCardSection({ userId }: GrowthCardSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <GrowthCardWidget userId={userId} />
    </div>
  );
}
