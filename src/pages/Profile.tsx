
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getUserAnswers, getProfileRole, getProfileGoal } from "@/services/QuestionService";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { AboutSection } from "@/components/profile/AboutSection";
import { ExperienceSection } from "@/components/profile/ExperienceSection";
import { EducationSection } from "@/components/profile/EducationSection";
import { 
  getSkillsBasedOnAnswers, 
  getExperienceBasedOnRole, 
  getEducationBasedOnAnswers 
} from "@/utils/profileUtils";
import type { UserAnswers } from "@/utils/profileUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "@/utils/uuid";

// Define interfaces for profile data
interface ExperienceItem {
  id?: string;
  title: string;
  description: string;
}

interface EducationItem {
  id?: string;
  title: string;
  description: string;
}

interface UserProfile {
  name?: string;
  about_text?: string;
  phone_number?: string;
  cover_color?: string;
  profile_image?: string;
  skills?: string[];
  experiences?: ExperienceItem[];
  education?: EducationItem[];
}

export default function Profile() {
  // Base state
  const [userAnswers, setUserAnswers] = useState<UserAnswers | null>(null);
  const [userName, setUserName] = useState<string>("Lansa User");
  const [isLoading, setIsLoading] = useState(true);
  
  // Extended state for editable profile
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [aboutText, setAboutText] = useState<string>("");
  const [coverColor, setCoverColor] = useState<string>("#FF6B4A");
  const [profileImage, setProfileImage] = useState<string>("");
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [educationItems, setEducationItems] = useState<EducationItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      
      const answers = await getUserAnswers(user.id);
      if (answers) {
        setUserAnswers(answers);
      }
      
      try {
        // Try to fetch the user profile
        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          throw error;
        }
        
        if (profileData) {
          // If profile exists, set all the values from it
          setUserProfile(profileData);
          if (profileData.name) setUserName(profileData.name);
          if (profileData.phone_number) setPhoneNumber(profileData.phone_number);
          if (profileData.about_text) setAboutText(profileData.about_text);
          if (profileData.cover_color) setCoverColor(profileData.cover_color);
          if (profileData.profile_image) setProfileImage(profileData.profile_image);
          if (profileData.skills && profileData.skills.length > 0) {
            setUserSkills(profileData.skills);
          } else if (answers) {
            // Fall back to generated skills if not in profile
            setUserSkills(getSkillsBasedOnAnswers(answers));
          }
          
          if (profileData.experiences && profileData.experiences.length > 0) {
            setExperiences(profileData.experiences.map(exp => ({
              ...exp,
              id: exp.id || uuidv4()
            })));
          } else {
            // Fall back to generated experiences
            const role = getProfileRole(answers?.question1);
            const generatedExperiences = getExperienceBasedOnRole(role);
            setExperiences(generatedExperiences.map(exp => ({
              ...exp,
              id: uuidv4()
            })));
          }
          
          if (profileData.education && profileData.education.length > 0) {
            setEducationItems(profileData.education.map(edu => ({
              ...edu,
              id: edu.id || uuidv4()
            })));
          } else {
            // Fall back to generated education
            const goal = getProfileGoal(answers?.question3);
            const generatedEducation = getEducationBasedOnAnswers(answers, goal);
            setEducationItems(generatedEducation.map(edu => ({
              ...edu,
              id: uuidv4()
            })));
          }
        } else {
          // If no profile exists, use generated data
          const role = getProfileRole(answers?.question1);
          const goal = getProfileGoal(answers?.question3);
          setUserSkills(getSkillsBasedOnAnswers(answers));
          
          const generatedExperiences = getExperienceBasedOnRole(role);
          setExperiences(generatedExperiences.map(exp => ({
            ...exp,
            id: uuidv4()
          })));
          
          const generatedEducation = getEducationBasedOnAnswers(answers, goal);
          setEducationItems(generatedEducation.map(edu => ({
            ...edu,
            id: uuidv4()
          })));
          
          // In a real app, you would fetch the user's name from their profile
          if (user.email) {
            setUserName(user.email.split('@')[0]);
          }
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast({
          title: "Error loading profile",
          description: "Could not load your profile data.",
          variant: "destructive",
        });
        
        // If there's an error, set up basic profile data
        if (answers) {
          const role = getProfileRole(answers.question1);
          const goal = getProfileGoal(answers.question3);
          setUserSkills(getSkillsBasedOnAnswers(answers));
          setExperiences(getExperienceBasedOnRole(role).map(exp => ({
            ...exp,
            id: uuidv4()
          })));
          setEducationItems(getEducationBasedOnAnswers(answers, goal).map(edu => ({
            ...edu,
            id: uuidv4()
          })));
        }
        
        if (user.email) {
          setUserName(user.email.split('@')[0]);
        }
      }
      
      setIsLoading(false);
    }
    
    loadProfile();
  }, [user, toast]);

  // Update or create profile data function
  const updateProfileData = async (updatedData: Partial<UserProfile>) => {
    if (!user?.id) return;
    
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      let result;
      
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('user_profiles')
          .update(updatedData)
          .eq('user_id', user.id);
      } else {
        // Create new profile
        result = await supabase
          .from('user_profiles')
          .insert([{ user_id: user.id, ...updatedData }]);
      }
      
      if (result.error) throw result.error;
      
      // Update local state with the changes
      setUserProfile(prev => prev ? { ...prev, ...updatedData } : { ...updatedData });
      
      return result;
    } catch (error) {
      console.error("Error updating profile data:", error);
      throw error;
    }
  };

  // Function to update user answers in the database
  const updateUserAnswer = async (field: string, value: string) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('user_answers')
      .update({ [field]: value })
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error updating answer:', error);
      throw new Error('Failed to update profile');
    }
    
    // Update local state
    setUserAnswers(prev => {
      if (!prev) return { [field]: value } as UserAnswers;
      return { ...prev, [field]: value };
    });
  };

  // Function to update user name
  const updateUserName = async (name: string) => {
    try {
      await updateProfileData({ name });
      setUserName(name);
      
      toast({
        title: "Name updated",
        description: "Your name has been updated successfully.",
      });
    } catch (error) {
      throw error;
    }
  };

  // Function to update phone number
  const updatePhoneNumber = async (phone: string) => {
    try {
      await updateProfileData({ phone_number: phone });
      setPhoneNumber(phone);
    } catch (error) {
      throw error;
    }
  };

  // Function to update about text
  const updateAboutText = async (text: string) => {
    try {
      await updateProfileData({ about_text: text });
      setAboutText(text);
    } catch (error) {
      throw error;
    }
  };

  // Function to update cover color
  const updateCoverColor = async (color: string) => {
    try {
      await updateProfileData({ cover_color: color });
      setCoverColor(color);
      toast({
        title: "Cover updated",
        description: "Your profile cover color has been updated.",
      });
    } catch (error) {
      throw error;
    }
  };

  // Function to add a new skill
  const addSkill = async (skill: string) => {
    try {
      const updatedSkills = [...userSkills, skill];
      await updateProfileData({ skills: updatedSkills });
      setUserSkills(updatedSkills);
    } catch (error) {
      throw error;
    }
  };

  // Function to remove a skill
  const removeSkill = async (skillToRemove: string) => {
    try {
      const updatedSkills = userSkills.filter(skill => skill !== skillToRemove);
      await updateProfileData({ skills: updatedSkills });
      setUserSkills(updatedSkills);
    } catch (error) {
      throw error;
    }
  };

  // Function to add a new experience
  const addExperience = async (experience: ExperienceItem) => {
    try {
      const newExperience = { ...experience, id: uuidv4() };
      const updatedExperiences = [...experiences, newExperience];
      await updateProfileData({ experiences: updatedExperiences });
      setExperiences(updatedExperiences);
    } catch (error) {
      throw error;
    }
  };

  // Function to edit an experience
  const editExperience = async (id: string, updatedExperience: ExperienceItem) => {
    try {
      const updatedExperiences = experiences.map(exp => 
        exp.id === id ? { ...updatedExperience, id } : exp
      );
      await updateProfileData({ experiences: updatedExperiences });
      setExperiences(updatedExperiences);
    } catch (error) {
      throw error;
    }
  };

  // Function to remove an experience
  const removeExperience = async (id: string) => {
    try {
      const updatedExperiences = experiences.filter(exp => exp.id !== id);
      await updateProfileData({ experiences: updatedExperiences });
      setExperiences(updatedExperiences);
    } catch (error) {
      throw error;
    }
  };

  // Function to add a new education item
  const addEducation = async (education: EducationItem) => {
    try {
      const newEducation = { ...education, id: uuidv4() };
      const updatedEducation = [...educationItems, newEducation];
      await updateProfileData({ education: updatedEducation });
      setEducationItems(updatedEducation);
    } catch (error) {
      throw error;
    }
  };

  // Function to edit an education item
  const editEducation = async (id: string, updatedEducation: EducationItem) => {
    try {
      const updatedEducationItems = educationItems.map(edu => 
        edu.id === id ? { ...updatedEducation, id } : edu
      );
      await updateProfileData({ education: updatedEducationItems });
      setEducationItems(updatedEducationItems);
    } catch (error) {
      throw error;
    }
  };

  // Function to remove an education item
  const removeEducation = async (id: string) => {
    try {
      const updatedEducationItems = educationItems.filter(edu => edu.id !== id);
      await updateProfileData({ education: updatedEducationItems });
      setEducationItems(updatedEducationItems);
    } catch (error) {
      throw error;
    }
  };

  // Function to upload profile image
  const uploadProfileImage = async (file: File) => {
    if (!user?.id) return "";
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-profile-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;
      
      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL for the uploaded image
      const { data } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);
        
      const publicUrl = data.publicUrl;
      
      // Update profile with the new image URL
      await updateProfileData({ profile_image: publicUrl });
      setProfileImage(publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E]">Loading your profile...</div>
      </div>
    );
  }

  const role = getProfileRole(userAnswers?.question1);
  const goal = getProfileGoal(userAnswers?.question3);
  const blocker = userAnswers?.question2 || "Identifying my unique value proposition";

  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
      <ProfileHeader 
        userName={userName} 
        role={role} 
        user={user}
        coverColor={coverColor}
        onCoverColorChange={updateCoverColor} 
      />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Sidebar */}
          <ProfileSidebar 
            userName={userName}
            role={role}
            email={user?.email || ''}
            skills={userSkills}
            goal={goal}
            phoneNumber={phoneNumber}
            coverColor={coverColor}
            profileImage={profileImage}
            onUpdate={updateUserAnswer}
            onUpdateUserName={updateUserName}
            onUpdatePhoneNumber={updatePhoneNumber}
            onAddSkill={addSkill}
            onRemoveSkill={removeSkill}
            onUploadProfileImage={uploadProfileImage}
          />
          
          {/* Right Column - Experience & Education */}
          <div className="lg:col-span-8 space-y-8">
            {/* About Me */}
            <AboutSection 
              role={role}
              goal={goal}
              blocker={blocker}
              aboutText={aboutText}
              onUpdate={updateUserAnswer}
              onUpdateAbout={updateAboutText}
            />
            
            {/* Experience */}
            <ExperienceSection 
              experiences={experiences}
              onAddExperience={addExperience}
              onEditExperience={editExperience}
              onRemoveExperience={removeExperience}
            />
            
            {/* Education */}
            <EducationSection 
              education={educationItems}
              onAddEducation={addEducation}
              onEditEducation={editEducation}
              onRemoveEducation={removeEducation}
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
