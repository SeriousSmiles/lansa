
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "../useProfileData";

interface UseProfileTextProps {
  userId: string | undefined;
  updateProfileData: (updatedData: Partial<UserProfile>) => Promise<any>;
}

export function useProfileText({ userId, updateProfileData }: UseProfileTextProps) {
  const [userName, setUserName] = useState<string>("Lansa User");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userTitle, setUserTitle] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [aboutText, setAboutText] = useState<string>("");
  const { toast } = useToast();

  // Function to update user name
  const updateUserName = async (name: string) => {
    if (!userId) {
      console.error("Cannot update name: userId is undefined");
      return;
    }
    
    try {
      console.log("🔄 Updating user name to:", name);
      await updateProfileData({ name });
      setUserName(name);
      
      console.log("✅ User name updated successfully");
      toast({
        title: "Name updated",
        description: "Your name has been updated successfully.",
      });
    } catch (error) {
      console.error("❌ Error updating name:", error);
      toast({
        title: "Error updating name",
        description: "There was an error updating your name. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to update user email
  const updateUserEmail = async (email: string) => {
    if (!userId) {
      console.error("Cannot update email: userId is undefined");
      return;
    }
    
    try {
      console.log("🔄 Updating user email to:", email);
      await updateProfileData({ email });
      setUserEmail(email);
      
      console.log("✅ User email updated successfully");
      toast({
        title: "Email updated",
        description: "Your email has been updated successfully.",
      });
    } catch (error) {
      console.error("❌ Error updating email:", error);
      toast({
        title: "Error updating email",
        description: "There was an error updating your email. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to update user title
  const updateUserTitle = async (title: string) => {
    if (!userId) {
      console.error("Cannot update title: userId is undefined");
      return;
    }
    
    try {
      console.log("🔄 Updating user title to:", title);
      await updateProfileData({ title });
      setUserTitle(title);
      
      console.log("✅ User title updated successfully");
      toast({
        title: "Title updated",
        description: "Your title has been updated successfully.",
      });
    } catch (error) {
      console.error("❌ Error updating title:", error);
      toast({
        title: "Error updating title",
        description: "There was an error updating your title. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to update phone number
  const updatePhoneNumber = async (phone: string) => {
    if (!userId) {
      console.error("Cannot update phone: userId is undefined");
      return;
    }
    
    try {
      console.log("🔄 Updating phone number to:", phone);
      await updateProfileData({ phone_number: phone });
      setPhoneNumber(phone);
      
      console.log("✅ Phone number updated successfully");
      toast({
        title: "Phone number updated",
        description: "Your phone number has been updated successfully.",
      });
    } catch (error) {
      console.error("❌ Error updating phone number:", error);
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
    if (!userId) {
      console.error("Cannot update about text: userId is undefined");
      return;
    }
    
    try {
      console.log("🔄 Updating about text to:", text);
      await updateProfileData({ about_text: text });
      setAboutText(text);
      
      console.log("✅ About text updated successfully");
      toast({
        title: "About text updated",
        description: "Your about text has been updated successfully.",
      });
    } catch (error) {
      console.error("❌ Error updating about text:", error);
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
    userEmail,
    setUserEmail,
    userTitle,
    setUserTitle,
    phoneNumber,
    setPhoneNumber,
    aboutText,
    setAboutText,
    updateUserName,
    updateUserEmail,
    updateUserTitle,
    updatePhoneNumber,
    updateAboutText
  };
}
