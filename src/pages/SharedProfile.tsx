
import { useParams } from "react-router-dom";
import { ProfileLoadingState } from "@/components/profile/shared/ProfileLoadingState";
import { ProfileNotFound } from "@/components/profile/shared/ProfileNotFound";
import { SharedProfileContainer } from "@/components/profile/shared/SharedProfileContainer";
import { useSharedProfileData } from "@/hooks/useSharedProfileData";

export default function SharedProfile() {
  // Get the URL parameter which could be either just userId or name-userId format
  const { userId: urlParam } = useParams();
  const { isLoading, profileData, profileError } = useSharedProfileData(urlParam);

  if (isLoading) {
    return <ProfileLoadingState />;
  }
  
  if (!profileData) {
    return <ProfileNotFound errorType={profileError} />;
  }

  return <SharedProfileContainer profileData={profileData} urlParam={urlParam} />;
}
