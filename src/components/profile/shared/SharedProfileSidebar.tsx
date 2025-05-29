
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
      <Card className="bg-white rounded-xl p-4 sm:p-6 shadow">
        {/* Profile header with cover color */}
        <div 
          className="h-12 sm:h-16 -m-4 sm:-m-6 mb-4 rounded-t-xl" 
          style={{ backgroundColor: coverColor }}
        ></div>
        
        {/* Profile content */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start mb-4">
          {profileImage && (
            <div className="flex-shrink-0">
              <img 
                src={profileImage} 
                alt={`${userName}'s profile`}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow -mt-6 sm:-mt-8" 
                style={{ borderColor: "#FFFFFF" }}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="text-xl sm:text-2xl font-semibold truncate">{userName}</div>
            <div 
              className="text-base sm:text-lg font-medium"
              style={{ color: highlightColor }}
            >
              {userTitle || role}
            </div>
          </div>
        </div>
        
        {/* Contact information */}
        <div className="mt-4 space-y-2 text-sm text-gray-600">
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
        
        {/* Skills */}
        {userSkills.length > 0 && (
          <div className="mt-6">
            <h3 
              className="font-semibold text-base sm:text-lg mb-2"
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
              className="font-semibold text-base sm:text-lg mb-2"
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
              className="font-semibold text-base sm:text-lg mb-2"
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
      </Card>
    </div>
  );
}
