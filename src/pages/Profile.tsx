
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { AboutSection } from "@/components/profile/AboutSection";
import { ExperienceSection } from "@/components/profile/ExperienceSection";
import { EducationSection } from "@/components/profile/EducationSection";
import { useProfileData } from "@/hooks/useProfileData";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = useProfileData(user?.id);

  if (profile.isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E]">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
      <ProfileHeader 
        userName={profile.userName} 
        role={profile.role} 
        user={profile.user}
        coverColor={profile.coverColor}
        onCoverColorChange={profile.updateCoverColor} 
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
            />
            
            {/* Experience */}
            <ExperienceSection 
              experiences={profile.experiences}
              onAddExperience={profile.addExperience}
              onEditExperience={profile.editExperience}
              onRemoveExperience={profile.removeExperience}
            />
            
            {/* Education */}
            <EducationSection 
              education={profile.educationItems}
              onAddEducation={profile.addEducation}
              onEditEducation={profile.editEducation}
              onRemoveEducation={profile.removeEducation}
            />
            
            {/* Actions Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/dashboard")} 
                className="px-8 py-6 h-auto text-lg"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        © 2025 Lansa N.V.
      </footer>
    </div>
  );
}
