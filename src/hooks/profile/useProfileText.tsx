
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "../useProfileData";

interface UseProfileTextProps {
  userId: string | undefined;
  updateProfileData: (updatedData: Partial<UserProfile>) => Promise<any>;
}

export function useProfileText({ userId, updateProfileData }: UseProfileTextProps) {
  const [userName, setUserName] = useState<string>("Lansa User");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [aboutText, setAboutText] = useState<string>("");
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

  return {
    userName,
    setUserName,
    phoneNumber,
    setPhoneNumber,
    aboutText,
    setAboutText,
    updateUserName,
    updatePhoneNumber,
    updateAboutText
  };
}
