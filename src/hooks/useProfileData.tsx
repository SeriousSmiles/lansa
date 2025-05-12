import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserAnswers, getProfileRole, getProfileGoal } from "@/services/QuestionService";
import { 
  getSkillsBasedOnAnswers, 
  getExperienceBasedOnRole, 
  getEducationBasedOnAnswers 
} from "@/utils/profileUtils";
import type { UserAnswers, ExperienceItem, EducationItem } from "@/utils/profileUtils";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "@/utils/uuid";

// Define interface for profile data
export interface UserProfile {
  user_id?: string;
  name?: string;
  about_text?: string;
  phone_number?: string;
  cover_color?: string;
  profile_image?: string;
  skills?: string[];
  experiences?: ExperienceItem[];
  education?: EducationItem[];
  created_at?: string;
  updated_at?: string;
}

export interface ProfileDataReturn {
  // User data
  user: any;
  userName: string;
  setUserName: (name: string) => void;
  userAnswers: UserAnswers | null;
  role: string;
  goal: string;
  blocker: string;
  isLoading: boolean;
  
  // Profile fields
  phoneNumber: string;
  aboutText: string;
  coverColor: string;
  profileImage: string;
  userSkills: string[];
  experiences: ExperienceItem[];
  educationItems: EducationItem[];

  // Update functions
  updateUserName: (name: string) => Promise<void>;
  updatePhoneNumber: (phone: string) => Promise<void>;
  updateAboutText: (text: string) => Promise<void>;
  updateCoverColor: (color: string) => Promise<void>;
  updateUserAnswer: (field: string, value: string) => Promise<void>;
  
  // Skills functions
  addSkill: (skill: string) => Promise<void>;
  removeSkill: (skillToRemove: string) => Promise<void>;
  
  // Experience functions
  addExperience: (experience: ExperienceItem) => Promise<void>;
  editExperience: (id: string, updatedExperience: ExperienceItem) => Promise<void>;
  removeExperience: (id: string) => Promise<void>;
  
  // Education functions
  addEducation: (education: EducationItem) => Promise<void>;
  editEducation: (id: string, updatedEducation: EducationItem) => Promise<void>;
  removeEducation: (id: string) => Promise<void>;
  
  // Image upload
  uploadProfileImage: (file: File) => Promise<string>;
}

export function useProfileData(userId: string | undefined): ProfileDataReturn {
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
  
  const { toast } = useToast();
  
  // Convert JSON from database to our typed objects
  const convertJsonToExperienceItems = (jsonData: any): ExperienceItem[] => {
    if (!jsonData || !Array.isArray(jsonData)) return [];
    
    return jsonData.map((item: any) => ({
      id: item.id || uuidv4(),
      title: item.title || "",
      description: item.description || ""
    }));
  };
  
  const convertJsonToEducationItems = (jsonData: any): EducationItem[] => {
    if (!jsonData || !Array.isArray(jsonData)) return [];
    
    return jsonData.map((item: any) => ({
      id: item.id || uuidv4(),
      title: item.title || "",
      description: item.description || ""
    }));
  };

  useEffect(() => {
    async function loadProfile() {
      if (!userId) return;
      
      const answers = await getUserAnswers(userId);
      if (answers) {
        setUserAnswers(answers);
      }
      
      try {
        // Try to fetch the user profile
        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          throw error;
        }
        
        if (profileData) {
          // If profile exists, set all the values from it
          setUserProfile({
            ...profileData,
            experiences: convertJsonToExperienceItems(profileData.experiences),
            education: convertJsonToEducationItems(profileData.education)
          });
          
          if (profileData.name) setUserName(profileData.name);
          if (profileData.phone_number) setPhoneNumber(profileData.phone_number);
          if (profileData.about_text) setAboutText(profileData.about_text);
          if (profileData.cover_color) setCoverColor(profileData.cover_color);
          if (profileData.profile_image) setProfileImage(profileData.profile_image);
          
          if (profileData.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0) {
            setUserSkills(profileData.skills);
          } else if (answers) {
            // Fall back to generated skills if not in profile
            setUserSkills(getSkillsBasedOnAnswers(answers));
          }
          
          if (profileData.experiences && Array.isArray(profileData.experiences) && profileData.experiences.length > 0) {
            setExperiences(convertJsonToExperienceItems(profileData.experiences));
          } else {
            // Fall back to generated experiences
            const role = getProfileRole(answers?.question1);
            const generatedExperiences = getExperienceBasedOnRole(role);
            setExperiences(generatedExperiences.map(exp => ({
              ...exp,
              id: uuidv4()
            })));
          }
          
          if (profileData.education && Array.isArray(profileData.education) && profileData.education.length > 0) {
            setEducationItems(convertJsonToEducationItems(profileData.education));
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
          if (answers && userId) {
            // Fix: Use userId instead of user_id from answers
            setUserName(userId.split('@')[0]);
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
      }
      
      setIsLoading(false);
    }
    
    loadProfile();
  }, [userId, toast]);

  // Update or create profile data function
  const updateProfileData = async (updatedData: Partial<UserProfile>) => {
    if (!userId) return;
    
    try {
      // Prepare data for Supabase by converting typed objects to raw JSON
      const supabaseData: any = { ...updatedData };
      
      // Convert typed arrays to JSON compatible format
      if (updatedData.experiences) {
        supabaseData.experiences = updatedData.experiences;
      }
      
      if (updatedData.education) {
        supabaseData.education = updatedData.education;
      }

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      let result;
      
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('user_profiles')
          .update(supabaseData)
          .eq('user_id', userId);
      } else {
        // Create new profile
        result = await supabase
          .from('user_profiles')
          .insert({ user_id: userId, ...supabaseData });
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
    if (!userId) return;

    const { error } = await supabase
      .from('user_answers')
      .update({ [field]: value })
      .eq('user_id', userId);
    
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
    if (!userId) return "";
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-profile-${Date.now()}.${fileExt}`;
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

  const role = getProfileRole(userAnswers?.question1);
  const goal = getProfileGoal(userAnswers?.question3);
  const blocker = userAnswers?.question2 || "Identifying my unique value proposition";

  return {
    // User data
    user: { id: userId },
    userName,
    setUserName,
    userAnswers,
    role,
    goal,
    blocker,
    isLoading,
    
    // Profile fields
    phoneNumber,
    aboutText,
    coverColor,
    profileImage,
    userSkills,
    experiences,
    educationItems,
    
    // Update functions
    updateUserName,
    updatePhoneNumber,
    updateAboutText,
    updateCoverColor,
    updateUserAnswer,
    
    // Skills functions
    addSkill,
    removeSkill,
    
    // Experience functions
    addExperience,
    editExperience,
    removeExperience,
    
    // Education functions
    addEducation,
    editEducation,
    removeEducation,
    
    // Image upload
    uploadProfileImage
  };
}
