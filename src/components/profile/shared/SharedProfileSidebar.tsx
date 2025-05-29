
import { Card } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";

interface SharedProfileSidebarProps {
  userName: string;
  role: string;
  goal: string;
  blocker: string;
  userSkills: string[];
  profileImage: string;
  phoneNumber?: string;
  userEmail?: string;
  userTitle?: string;
  coverColor?: string;
  highlightColor?: string;
  professionalGoal?: string;
  biggestChallenge?: string;
}

export function SharedProfileSidebar({
  userName,
  role,
  goal,
  blocker,
  userSkills,
  profileImage,
  phoneNumber,
  userEmail,
  userTitle,
  coverColor = "#1A1F71",
  highlightColor = "#FF6B4A",
  professionalGoal,
  biggestChallenge,
}: SharedProfileSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-4 lg:space-y-6">
      <Card className="bg-white rounded-xl shadow overflow-hidden">
        {/* Profile header with cover color */}
        <div 
          className="h-16 sm:h-20 md:h-24" 
          style={{ backgroundColor: coverColor }}
        ></div>
        
        {/* Profile content with better spacing */}
        <div className="p-4 sm:p-6 pt-0 -mt-8 sm:-mt-10 md:-mt-12">
          {/* Profile Avatar - Centered */}
          <div className="flex justify-center mb-4 sm:mb-6">
            {profileImage && (
              <img 
                src={profileImage} 
                alt={`${userName}'s profile`}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow" 
                style={{ borderColor: "#FFFFFF" }}
              />
            )}
          </div>
          
          {/* User Info - Better spacing and positioning */}
          <div className="w-full text-center space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight break-words px-2">
              {userName}
            </h1>
            
            <div className="flex flex-col items-center gap-1">
              <p className="font-medium text-lg sm:text-xl" style={{ color: highlightColor }}>
                {userTitle || role}
              </p>
            </div>
          </div>
          
          {/* Contact information - Separate section with better spacing */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="space-y-2 text-sm text-gray-600">
              {userEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0" style={{ color: highlightColor }} />
                  <span className="truncate">{userEmail}</span>
                </div>
              )}
              {phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" style={{ color: highlightColor }} />
                  <span>{phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Skills */}
          {userSkills.length > 0 && (
            <div className="mt-6">
              <h3 
                className="font-semibold text-base sm:text-lg mb-3"
                style={{ color: coverColor }}
              >
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {userSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm"
                    style={{ 
                      backgroundColor: `${highlightColor}20`,
                      color: highlightColor 
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Professional Goal */}
          {professionalGoal && (
            <div className="mt-6">
              <h3 
                className="font-semibold text-base sm:text-lg mb-3"
                style={{ color: coverColor }}
              >
                Professional Goal
              </h3>
              <p className="text-sm sm:text-base text-gray-700">{professionalGoal}</p>
            </div>
          )}
          
          {/* Biggest Challenge */}
          {(biggestChallenge || blocker) && (
            <div className="mt-6">
              <h3 
                className="font-semibold text-base sm:text-lg mb-3"
                style={{ color: coverColor }}
              >
                Biggest Challenge
              </h3>
              <blockquote 
                className="border-l-4 pl-3 sm:pl-4 italic text-sm sm:text-base text-gray-700"
                style={{ borderColor: highlightColor }}
              >
                "{biggestChallenge || blocker}"
              </blockquote>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
