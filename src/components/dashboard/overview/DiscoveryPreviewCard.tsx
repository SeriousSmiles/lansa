import { useState, useEffect } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { SwipeCard } from "@/components/discovery/SwipeCard";
import { DiscoveryProfile } from "@/services/discoveryService";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";

export function DiscoveryPreviewCard() {
  const { user } = useAuth();
  const { 
    userName, 
    userTitle, 
    aboutText, 
    profileImage, 
    userSkills, 
    coverColor, 
    highlightColor, 
    professionalGoal 
  } = useProfileData(user?.id);
  
  const [discoveryProfile, setDiscoveryProfile] = useState<DiscoveryProfile | null>(null);

  useEffect(() => {
    if (user?.id) {
      const profile: DiscoveryProfile = {
        user_id: user.id,
        name: userName || 'Your Name',
        title: userTitle || 'Your Title',
        about_text: aboutText,
        profile_image: profileImage,
        skills: userSkills || [],
        cover_color: coverColor,
        highlight_color: highlightColor || '#FF6B4A',
        professional_goal: professionalGoal
      };
      setDiscoveryProfile(profile);
    }
  }, [user?.id, userName, userTitle, aboutText, profileImage, userSkills, coverColor, highlightColor, professionalGoal]);

  if (!discoveryProfile) {
    return (
      <AnimatedCard delay={0.2} className="h-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg md:text-xl">Discovery Preview</CardTitle>
          <CardDescription>Loading your discovery profile...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted rounded-lg animate-pulse" />
        </CardContent>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard delay={0.2} className="h-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg md:text-xl">How You Appear in Discovery</CardTitle>
        <CardDescription>This is how other users see your profile</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full max-w-[280px] h-[400px] mx-auto">
          <SwipeCard
            profile={discoveryProfile}
            onSwipe={() => {}} // No-op for preview
            isActive={false} // Disable interactions
            zIndex={1}
          />
        </div>
        <div className="text-center text-sm text-muted-foreground mt-4">
          Complete your profile to improve how you appear to potential matches.
        </div>
      </CardContent>
    </AnimatedCard>
  );
}