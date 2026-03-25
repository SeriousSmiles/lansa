
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ProfileError } from "@/hooks/useSharedProfileData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Globe, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface ProfileNotFoundProps {
  errorType?: ProfileError;
  isOwnProfile?: boolean;
  userId?: string;
  shareUrl?: string;
}

export function ProfileNotFound({ errorType, isOwnProfile, userId, shareUrl }: ProfileNotFoundProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPublishing, setIsPublishing] = useState(false);

  const handleMakePublic = async () => {
    if (!userId) return;
    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_public: true })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success("Your profile is now public!");
      // Small delay so the DB trigger can populate user_profiles_public
      setTimeout(() => {
        if (shareUrl) {
          navigate(shareUrl, { replace: true });
        } else {
          navigate('/profile');
        }
      }, 800);
    } catch (err) {
      toast.error("Could not update profile. Please try again.");
      setIsPublishing(false);
    }
  };

  // Logged-in user viewing their own private profile
  if (isOwnProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Your profile is private</h1>
        <p className="text-sm text-muted-foreground max-w-xs text-center">
          Make your profile public so employers and connections can view your shared profile link.
        </p>
        <Button
          onClick={handleMakePublic}
          disabled={isPublishing}
          className="mt-2 gap-2"
        >
          <Globe className="w-4 h-4" />
          {isPublishing ? "Publishing…" : "Make Profile Public"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-4">
      <div className="text-2xl font-semibold text-foreground mb-2">Profile not found</div>
      <p className="text-sm text-muted-foreground max-w-xs text-center">{getMessage()}</p>
      <Button
        onClick={() => navigate(user ? "/dashboard" : "/auth")}
        className="mt-4"
      >
        {user ? "Back to Dashboard" : "Go to Login"}
      </Button>
    </div>
  );
}
