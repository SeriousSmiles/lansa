
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
import { useElementAnimation } from "@/utils/animationHelpers";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = useProfileData(user?.id);
  const guideButtonRef = useRef<HTMLButtonElement>(null);
  const mainContentRef = useElementAnimation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
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
    if (contentRef.current) {
      gsap.from(contentRef.current, {
        opacity: 0,
        x: 20,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.2
      });
    }
    
    // Animate sidebar with different animation
    if (sidebarRef.current) {
      gsap.from(sidebarRef.current, {
        opacity: 0,
        x: -20,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.1
      });
    }
    
    // Animate each section with staggered delay
    const sections = document.querySelectorAll('.content-section');
    gsap.from(sections, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.15,
      ease: "power2.out",
      delay: 0.4
    });
  }, [profile.isLoading]);

  // Function to trigger the onboarding sequence
  const handleStartOnboarding = () => {
    console.log("Guide button clicked!");
    runOnboardingSequence();
  };

  if (profile.isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E] animate-pulse">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col animate-fade-in"
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

      <main ref={mainContentRef} className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Sidebar */}
          <div ref={sidebarRef} className="lg:col-span-4">
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
          </div>
          
          {/* Right Column - Experience & Education */}
          <div ref={contentRef} className="lg:col-span-8 space-y-8">
            {/* About Me */}
            <div className="content-section hover-lift">
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
            </div>
            
            {/* Experience */}
            <div className="content-section hover-lift">
              <ExperienceSection 
                experiences={profile.experiences}
                onAddExperience={profile.addExperience}
                onEditExperience={profile.editExperience}
                onRemoveExperience={profile.removeExperience}
                themeColor={profile.coverColor}
                highlightColor={profile.highlightColor}
              />
            </div>
            
            {/* Education */}
            <div className="content-section hover-lift">
              <EducationSection 
                education={profile.educationItems}
                onAddEducation={profile.addEducation}
                onEditEducation={profile.editEducation}
                onRemoveEducation={profile.removeEducation}
                themeColor={profile.coverColor}
                highlightColor={profile.highlightColor}
              />
            </div>
            
            {/* Actions Section */}
            <div className="flex justify-center animate-fade-in">
              <Button 
                onClick={() => navigate("/dashboard")} 
                className="py-2 h-auto btn-animate"
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
        className="text-center py-6 text-sm animate-fade-in"
        style={{ color: `${profile.coverColor}90` }}
      >
        © 2025 Lansa N.V.
      </footer>
      
      {/* Guide Button - Fixed positioning ensures it's always visible */}
      <GuideButton 
        onClick={handleStartOnboarding} 
        ref={guideButtonRef}
        className="!fixed" 
      />
    </div>
  );
}
