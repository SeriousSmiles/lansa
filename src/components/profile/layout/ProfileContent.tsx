
import { useRef, useEffect } from "react";
import { NavigateFunction } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProfileSidebar } from "../ProfileSidebar";
import { AboutSection } from "../AboutSection";
import { ExperienceSection } from "../ExperienceSection";
import { EducationSection } from "../EducationSection";
import { OpenMarketButton } from "../buttons/OpenMarketButton";
import { gsap } from "gsap";
import { getContrastTextColor } from "@/utils/colorUtils";
import { ProfileDataReturn } from "@/hooks/useProfileData";

interface ProfileContentProps {
  profile: ProfileDataReturn;
  textColor: string;
  navigate: NavigateFunction;
}

export function ProfileContent({ profile, textColor, navigate }: ProfileContentProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Calculate text contrast color (black or white) based on background
  const contrastTextColor = getContrastTextColor(profile.coverColor);
  
  // Determine if the theme is dark
  const isDarkTheme = contrastTextColor === "#FFFFFF";
  
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

  return (
    <>
      {/* Left Column - Sidebar */}
      <div ref={sidebarRef} className="lg:col-span-4">
        <ProfileSidebar 
          userName={profile.userName}
          role={profile.role}
          email={profile.userEmail || profile.user?.email || ''}
          title={profile.userTitle}
          skills={profile.userSkills}
          goal={profile.goal}
          phoneNumber={profile.phoneNumber}
          coverColor={profile.coverColor}
          highlightColor={profile.highlightColor}
          profileImage={profile.profileImage}
          professionalGoal={profile.professionalGoal}
          onUpdate={profile.updateUserAnswer}
          onUpdateUserName={profile.updateUserName}
          onUpdateTitle={profile.updateUserTitle}
          onUpdatePhoneNumber={profile.updatePhoneNumber}
          onUpdateProfessionalGoal={profile.updateProfessionalGoal}
          onAddSkill={profile.addSkill}
          onRemoveSkill={profile.removeSkill}
          onUploadProfileImage={profile.uploadProfileImage}
        />
        
        {/* Open Market Button */}
        <div className="mt-6">
          <OpenMarketButton highlightColor={profile.highlightColor} />
        </div>
      </div>
      
      {/* Right Column - Experience & Education */}
      <div ref={contentRef} className="lg:col-span-8">
        <div className="space-y-8">
          {/* About Me */}
          <div className="content-section hover-lift">
            <AboutSection 
              role={profile.role}
              goal={profile.goal}
              blocker={profile.blocker}
              aboutText={profile.aboutText}
              onUpdate={profile.updateUserAnswer}
              onUpdateAbout={profile.updateAboutText}
              onUpdateBiggestChallenge={profile.updateBiggestChallenge}
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
        </div>
        
        {/* Actions Section with better spacing */}
        <div className="flex justify-center animate-fade-in mt-12 mb-8">
          <Button 
            onClick={() => navigate("/dashboard")} 
            className="py-2 h-auto btn-animate"
            variant={isDarkTheme ? "contrast" : "outline"}
            style={{
              borderColor: `${profile.coverColor}30`,
              color: contrastTextColor
            }}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </>
  );
}
