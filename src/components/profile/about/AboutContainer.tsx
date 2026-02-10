
import { Card, CardContent } from "@/components/ui/card";
import { AboutMeSection } from "./AboutMeSection";
import { BiggestChallengeSection } from "./BiggestChallengeSection";

interface AboutContainerProps {
  role: string;
  goal: string;
  blocker: string;
  aboutText?: string;
  onUpdate?: (field: string, value: string) => Promise<void>;
  onUpdateAbout?: (text: string) => Promise<void>;
  onUpdateBiggestChallenge?: (challenge: string) => Promise<void>;
  themeColor?: string;
  highlightColor?: string;
  userId?: string;
}

export function AboutContainer({ 
  role, 
  goal, 
  blocker, 
  aboutText,
  onUpdate,
  onUpdateAbout,
  onUpdateBiggestChallenge,
  themeColor,
  highlightColor = "#FF6B4A",
  userId
}: AboutContainerProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <AboutMeSection
          role={role}
          goal={goal}
          aboutText={aboutText}
          onUpdateAbout={onUpdateAbout}
          highlightColor={highlightColor}
          userId={userId}
        />
        
        <BiggestChallengeSection
          blocker={blocker}
          onUpdate={onUpdateBiggestChallenge}
          highlightColor={highlightColor}
        />
      </CardContent>
    </Card>
  );
}
