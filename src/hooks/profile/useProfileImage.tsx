
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "../useProfileData";

interface UseProfileImageProps {
  userId: string | undefined;
  updateProfileData: (updatedData: Partial<UserProfile>) => Promise<any>;
}

export function useProfileImage({ userId, updateProfileData }: UseProfileImageProps) {
  const [profileImage, setProfileImage] = useState<string>("");

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

  return {
    profileImage,
    setProfileImage,
    uploadProfileImage
  };
}
