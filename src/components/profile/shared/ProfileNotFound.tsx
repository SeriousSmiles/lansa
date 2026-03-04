
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ProfileError } from "@/hooks/useSharedProfileData";

interface ProfileNotFoundProps {
  errorType?: ProfileError;
}

export function ProfileNotFound({ errorType }: ProfileNotFoundProps) {
  const navigate = useNavigate();

  const getMessage = () => {
    if (errorType === 'permission_denied') {
      return "This profile is private or not available for public viewing.";
    }
    if (errorType === 'network_error') {
      return "Unable to load this profile. Please check your connection and try again.";
    }
    return "This profile doesn't exist or hasn't been made public yet.";
  };

  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col items-center justify-center gap-3">
      <div className="text-2xl text-[#2E2E2E] mb-2">Profile not found</div>
      <p className="text-sm text-[#2E2E2E]/60 max-w-xs text-center">{getMessage()}</p>
      <Button 
        onClick={() => navigate("/auth")} 
        className="bg-[#E97551] hover:bg-[#D56543] text-white px-8 py-2 rounded-md transition-colors mt-4"
      >
        Return to Login
      </Button>
    </div>
  );
}
