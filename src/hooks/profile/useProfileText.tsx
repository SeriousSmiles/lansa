
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "../useProfileData";
import { useAuth } from "@/contexts/AuthContext";

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
  const { session } = useAuth();

  // Auto-populate email from auth session if not already set
  useEffect(() => {
    if (session?.user?.email && !userEmail) {
      setUserEmail(session.user.email);
    }
  }, [session?.user?.email, userEmail]);

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

  // Function to update user email
  const updateUserEmail = async (email: string) => {
    try {
      await updateProfileData({ email });
      setUserEmail(email);
      
      toast({
        title: "Email updated",
        description: "Your email has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating email:", error);
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
    try {
      await updateProfileData({ title });
      setUserTitle(title);
      
      toast({
        title: "Title updated",
        description: "Your title has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating title:", error);
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
