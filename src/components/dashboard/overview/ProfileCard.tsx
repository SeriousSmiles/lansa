
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfileData } from "@/hooks/useProfileData";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileCardProps {
  role: string;
  goal: string;
}

export function ProfileCard({ role, goal }: ProfileCardProps) {
  const { user } = useAuth();
  const { 
    profileImage, 
    userTitle, 
    professionalGoal, 
    biggestChallenge, 
    userName,
    isLoading 
  } = useProfileData(user?.id);

  // Use database values if available, otherwise fall back to props
  const displayTitle = userTitle || role;
  const displayGoal = professionalGoal || goal;
  const displayChallenge = biggestChallenge || "Identifying my unique value proposition";

  return (
    <AnimatedCard delay={0.1} className="h-auto transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="w-12 h-12">
            <AvatarImage src={profileImage} alt={userName} />
            <AvatarFallback className="bg-[#FF6B4A] text-white text-lg font-bold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg md:text-xl">Your Profile</CardTitle>
            <CardDescription>Based on your profile information</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Title</h3>
              <p className="text-base md:text-lg">{displayTitle}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Professional Goal</h3>
              <p className="text-base md:text-lg">{displayGoal}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Biggest Challenge</h3>
              <p className="text-base md:text-lg">{displayChallenge}</p>
            </div>
            
            <div className="pt-2">
              <Link to="/profile">
                <Button variant="outline" size="sm" className="transition-colors duration-200 hover:bg-gray-50">
                  View Full Profile
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </AnimatedCard>
  );
}
