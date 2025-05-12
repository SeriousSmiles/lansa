
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { AboutSection } from "@/components/profile/AboutSection";
import { ExperienceSection } from "@/components/profile/ExperienceSection";
import { EducationSection } from "@/components/profile/EducationSection";
import { useProfileData } from "@/hooks/useProfileData";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = useProfileData(user?.id);

  // Generate theme colors based on primary color
  const themeColors = {
    primary: profile.coverColor,
    light: `${profile.coverColor}15`,
    medium: `${profile.coverColor}30`,
    border: `${profile.coverColor}50`,
    text: profile.coverColor,
  };
  
  // Calculate text contrast color (black or white) based on background
  const getContrastTextColor = (hexColor: string): string => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };
  
  const textColor = getContrastTextColor(profile.coverColor);

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
                variant="outline"
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
    </div>
  );
}
