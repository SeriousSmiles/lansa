
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import { User, MapPin, Briefcase, GraduationCap, Building2 } from "lucide-react";

interface ProfileCardProps {
  role: string;
  goal: string;
}

export function ProfileCard({ role, goal }: ProfileCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    userName, 
    userTitle, 
    aboutText, 
    profileImage, 
    userSkills, 
    experiences,
    educationItems,
    coverColor, 
    highlightColor,
    isLoading 
  } = useProfileData(user?.id);

  const handleCardClick = () => {
    if (user?.id && userName) {
      // Create SEO-friendly URL with user name and ID
      const urlName = userName.toLowerCase().replace(/\s+/g, '-');
      navigate(`/profile/share/${urlName}-${user.id}`);
    }
  };

  if (isLoading) {
    return (
      <AnimatedCard delay={0.1} className="h-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard delay={0.1} className="h-auto overflow-hidden">
      <Card className="border-0 shadow-none bg-transparent">
        {/* Cover Section */}
        <div 
          className="h-24 relative"
          style={{ backgroundColor: coverColor || '#1A1F2C' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
          <div className="absolute top-2 left-3">
            <h3 className="text-white text-sm font-medium">Your Profile</h3>
            <p className="text-white/80 text-xs">How you appear to others</p>
          </div>
        </div>

        <CardContent className="p-4 pt-2">
          {/* Profile Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="relative">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover border-4 border-background -mt-8 relative z-10"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted border-4 border-background -mt-8 relative z-10 flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 pt-2">
              <h4 className="font-semibold text-lg leading-tight">
                {userName || 'Your Name'}
              </h4>
              <p className="text-muted-foreground text-sm mb-1">
                {userTitle || role}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>Available globally</span>
              </div>
            </div>
          </div>

          {/* About Preview */}
          {aboutText && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {aboutText}
              </p>
            </div>
          )}

          {/* Goal Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Professional Goal</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {goal}
            </p>
          </div>

          {/* Skills Preview */}
          {userSkills && userSkills.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Top Skills</p>
              <div className="flex flex-wrap gap-1">
                {userSkills.slice(0, 4).map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs px-2 py-1"
                    style={{ 
                      backgroundColor: `${highlightColor || '#FF6B4A'}15`,
                      color: highlightColor || '#FF6B4A',
                      borderColor: `${highlightColor || '#FF6B4A'}30`
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
                {userSkills.length > 4 && (
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    +{userSkills.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Experience Summary */}
          {experiences && experiences.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Latest Experience</span>
              </div>
              <div className="pl-6">
                <p className="text-sm font-medium">{experiences[0].title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {experiences[0].description}
                </p>
                {experiences.length > 1 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    +{experiences.length - 1} more experience{experiences.length > 2 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Education Summary */}
          {educationItems && educationItems.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Education</span>
              </div>
              <div className="pl-6">
                <p className="text-sm font-medium">{educationItems[0].title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {educationItems[0].description}
                </p>
                {educationItems.length > 1 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    +{educationItems.length - 1} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={handleCardClick}
              variant="primary" 
              className="w-full btn-animate"
              style={{ 
                backgroundColor: highlightColor || '#FF6B4A',
                borderColor: highlightColor || '#FF6B4A'
              }}
            >
              View Full Profile
            </Button>
            <Link to="/profile" className="block">
              <Button 
                variant="outline" 
                className="w-full btn-animate"
                style={{ 
                  borderColor: highlightColor || '#FF6B4A',
                  color: highlightColor || '#FF6B4A'
                }}
              >
                Edit Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}
