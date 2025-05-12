
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "../useProfileData";

export function useProfileBasics(userId: string | undefined) {
  const [userName, setUserName] = useState<string>("Lansa User");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [aboutText, setAboutText] = useState<string>("");
  const [coverColor, setCoverColor] = useState<string>("#FF6B4A");
  const { toast } = useToast();

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
      console.error("Error updating name:", error);
      toast({
        title: "Error updating name",
        description: "There was an error updating your name. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to update phone number
  const updatePhoneNumber = async (phone: string) => {
    try {
      await updateProfileData({ phone_number: phone });
      setPhoneNumber(phone);
    } catch (error) {
      console.error("Error updating phone number:", error);
      toast({
        title: "Error updating phone number",
        description: "There was an error updating your phone number. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to update about text
  const updateAboutText = async (text: string) => {
    try {
      await updateProfileData({ about_text: text });
      setAboutText(text);
    } catch (error) {
      console.error("Error updating about text:", error);
      toast({
        title: "Error updating about text",
        description: "There was an error updating your about text. Please try again.",
        variant: "destructive",
      });
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
      console.error("Error updating cover color:", error);
      toast({
        title: "Error updating cover color",
        description: "There was an error updating your cover color. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update or create profile data function
  const updateProfileData = async (updatedData: Partial<UserProfile>) => {
    if (!userId) return;
    
    try {
      // Prepare data for Supabase by converting typed objects to raw JSON
      const supabaseData: any = { ...updatedData };
      
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      
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
      
      return result;
    } catch (error) {
      console.error("Error updating profile data:", error);
      throw error;
    }
  };

  // Function to update user answers in the database
  const updateUserAnswer = async (field: string, value: string) => {
    if (!userId) return;

    try {
      const { data: existingAnswer, error: fetchError } = await supabase
        .from('user_answers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      let result;
      
      if (existingAnswer) {
        // Update existing answer
        result = await supabase
          .from('user_answers')
          .update({ [field]: value })
          .eq('user_id', userId);
      } else {
        // Create new answer
        result = await supabase
          .from('user_answers')
          .insert({ user_id: userId, [field]: value });
      }
      
      if (result.error) {
        console.error('Error updating answer:', result.error);
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating answer:', error);
      throw error;
    }
  };

  return {
    userName,
    setUserName,
    phoneNumber,
    setPhoneNumber,
    aboutText,
    setAboutText, 
    coverColor,
    setCoverColor,
    updateUserName,
    updatePhoneNumber,
    updateAboutText,
    updateCoverColor,
    updateProfileData,
    updateUserAnswer
  };
}
