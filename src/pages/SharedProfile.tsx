
import { useParams, useLocation } from "react-router-dom";
import { ProfileLoadingState } from "@/components/profile/shared/ProfileLoadingState";
import { ProfileNotFound } from "@/components/profile/shared/ProfileNotFound";
import { SharedProfileContainer } from "@/components/profile/shared/SharedProfileContainer";
import { useSharedProfileData } from "@/hooks/useSharedProfileData";
import { SEOHead } from "@/components/SEOHead";

export default function SharedProfile() {
  // Get the URL parameter which could be either just userId or name-userId format
  const { userId: urlParam } = useParams();
  const location = useLocation();
  const { isLoading, profileData, profileError } = useSharedProfileData(urlParam);

  // State passed from ProfileCard when the user's own profile is private
  const isOwnProfile = location.state?.isOwnProfile as boolean | undefined;
  const ownUserId = location.state?.userId as string | undefined;
  const shareUrl = location.state?.shareUrl as string | undefined;

  if (isLoading) {
    return <ProfileLoadingState />;
  }
  
  if (!profileData) {
    return (
      <ProfileNotFound
        errorType={profileError}
        isOwnProfile={isOwnProfile}
        userId={ownUserId}
        shareUrl={shareUrl}
      />
    );
  }

  const displayName = profileData.userName?.trim() || "Professional";
  const title = `${displayName} — Professional Profile on Lansa`;
  const description = `View ${displayName}'s certified professional profile, skills, and experience on Lansa.`;
  const canonical = `https://www.lansa.online/profile/share/${urlParam ?? ""}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: canonical,
    mainEntity: {
      "@type": "Person",
      name: displayName,
      jobTitle: profileData.userTitle || undefined,
      description: profileData.aboutText || undefined,
      image: profileData.profileImage || undefined,
      address: profileData.location || undefined,
      knowsAbout: profileData.userSkills?.length ? profileData.userSkills : undefined,
    },
  };

  return (
    <>
      <SEOHead title={title} description={description} canonical={canonical} jsonLd={jsonLd} />
      <SharedProfileContainer profileData={profileData} urlParam={urlParam} />
    </>
  );
}

