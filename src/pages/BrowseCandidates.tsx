import { useAuth } from "@/contexts/AuthContext";
import { useUserType } from "@/hooks/useUserType";
import { Navigate, useNavigate } from "react-router-dom";
import { CandidateBrowseTab } from "@/components/dashboard/employer/CandidateBrowseTab";
import { MobileCandidateBrowser } from "@/components/mobile/employer/MobileCandidateBrowser";
import { LoadingSpinner } from "@/components/loading";
import { useIsMobile } from "@/hooks/use-mobile";

export default function BrowseCandidates() {
  const { user } = useAuth();
  const { userType, isLoading: userTypeLoading } = useUserType();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Redirect non-employers
  if (!userTypeLoading && userType !== 'employer') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!user || userTypeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <MobileCandidateBrowser 
        userId={user.id}
        onBack={() => navigate('/dashboard')}
      />
    );
  }

  // Desktop view - use CandidateBrowseTab with split-panel layout and certified candidates filter
  return (
    <div className="min-h-screen bg-background">
      <CandidateBrowseTab />
    </div>
  );
}
