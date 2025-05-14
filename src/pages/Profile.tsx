
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { AboutSection } from "@/components/profile/AboutSection";
import { ExperienceSection } from "@/components/profile/ExperienceSection";
import { EducationSection } from "@/components/profile/EducationSection";
import { useProfileData } from "@/hooks/useProfileData";
import { getContrastTextColor, generateThemeColors } from "@/utils/colorUtils";
import { GuideButton } from "@/components/guide/GuideButton";
import { runOnboardingSequence } from "@/utils/animationUtils";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = useProfileData(user?.id);
  const guideButtonRef = useRef<HTMLButtonElement>(null);

  // Generate theme colors based on primary color using our utility
  const themeColors = generateThemeColors(profile.coverColor);
  
  // Get text color based on background
  const textColor = getContrastTextColor(profile.coverColor);
  
  // Determine if the theme is dark
  const isDarkTheme = textColor === "#FFFFFF";
  
  // Animate elements when the page loads
  useEffect(() => {
    if (profile.isLoading) return;
    
    // Animate main content
    gsap.from("main .grid", {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power2.out",
      delay: 0.2
    });
    
    // Animate guide button
    if (guideButtonRef.current) {
      gsap.from(guideButtonRef.current, {
        scale: 0,
        opacity: 0,
        rotation: 180,
        duration: 1,
        ease: "elastic.out(1, 0.5)",
        delay: 1
      });
    }
  }, [profile.isLoading]);

  // Function to trigger the onboarding sequence
  const handleStartOnboarding = () => {
    runOnboardingSequence();
  };

  if (profile.isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E]">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: themeColors.light,
      }}
    >
      <ProfileHeader 
        userName={profile.userName} 
        role={profile.role} 
        user={profile.user}
        userId={user?.id}
        coverColor={profile.coverColor}
        highlightColor={profile.highlightColor}
        onCoverColorChange={profile.updateCoverColor}
        onHighlightColorChange={profile.updateHighlightColor}
      />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Sidebar */}
          <ProfileSidebar 
            userName={profile.userName}
            role={profile.role}
            email={user?.email || ''}
            skills={profile.userSkills}
            goal={profile.goal}
            phoneNumber={profile.phoneNumber}
            coverColor={profile.coverColor}
            highlightColor={profile.highlightColor}
            profileImage={profile.profileImage}
            onUpdate={profile.updateUserAnswer}
            onUpdateUserName={profile.updateUserName}
            onUpdatePhoneNumber={profile.updatePhoneNumber}
            onAddSkill={profile.addSkill}
            onRemoveSkill={profile.removeSkill}
            onUploadProfileImage={profile.uploadProfileImage}
          />
          
          {/* Right Column - Experience & Education */}
          <div className="lg:col-span-8 space-y-8">
            {/* About Me */}
            <AboutSection 
              role={profile.role}
              goal={profile.goal}
              blocker={profile.blocker}
              aboutText={profile.aboutText}
              onUpdate={profile.updateUserAnswer}
              onUpdateAbout={profile.updateAboutText}
              themeColor={profile.coverColor}
              highlightColor={profile.highlightColor}
            />
            
            {/* Experience */}
            <ExperienceSection 
              experiences={profile.experiences}
              onAddExperience={profile.addExperience}
              onEditExperience={profile.editExperience}
              onRemoveExperience={profile.removeExperience}
              themeColor={profile.coverColor}
              highlightColor={profile.highlightColor}
            />
            
            {/* Education */}
            <EducationSection 
              education={profile.educationItems}
              onAddEducation={profile.addEducation}
              onEditEducation={profile.editEducation}
              onRemoveEducation={profile.removeEducation}
              themeColor={profile.coverColor}
              highlightColor={profile.highlightColor}
            />
            
            {/* Actions Section */}
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate("/dashboard")} 
                className="py-2 h-auto"
                variant={isDarkTheme ? "contrast" : "outline"}
                style={{
                  borderColor: themeColors.border,
                  color: textColor
                }}
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer 
        className="text-center py-6 text-sm"
        style={{ color: `${profile.coverColor}90` }}
      >
        © 2025 Lansa N.V.
      </footer>
      
      {/* Guide Button */}
      <GuideButton 
        onClick={handleStartOnboarding} 
        ref={guideButtonRef}
      />
    </div>
  );
}
