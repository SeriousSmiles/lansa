
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";

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
}: SharedProfileSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-4">
      <Card className="bg-white rounded-xl p-6 shadow">
        {/* Rearranged to have profile image at top-left */}
        <div className="flex flex-col sm:flex-row gap-4 items-start mb-4">
          {profileImage && (
            <div>
              <img 
                src={profileImage} 
                alt={`${userName}'s profile`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow" 
                style={{ borderColor: `${coverColor}30` }}
              />
            </div>
          )}
          
          <div className="flex-1">
            <div className="text-2xl font-semibold">{userName}</div>
            <div 
              className="text-gray-600"
              style={{ color: coverColor }}
            >
              {role}
            </div>
            {userTitle && (
              <div className="text-sm text-gray-500 mt-1">
                {userTitle}
              </div>
            )}
          </div>
        </div>
        
        {/* Contact information */}
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          {userEmail && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" style={{ color: highlightColor }} />
              <span>{userEmail}</span>
            </div>
          )}
          {phoneNumber && (
            <div className="flex items-center gap-2">
              <span>Phone:</span>
              <span>{phoneNumber}</span>
            </div>
          )}
        </div>
        
        {/* Skills */}
        {userSkills.length > 0 && (
          <div className="mt-6">
            <h3 
              className="font-semibold text-lg mb-2"
              style={{ color: coverColor }}
            >
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {userSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm"
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
        {goal && (
          <div className="mt-6">
            <h3 
              className="font-semibold text-lg mb-2"
              style={{ color: coverColor }}
            >
              Professional Goal
            </h3>
            <p className="text-gray-700">{goal}</p>
          </div>
        )}
        
        {/* Biggest Challenge */}
        {blocker && (
          <div className="mt-6">
            <h3 
              className="font-semibold text-lg mb-2"
              style={{ color: coverColor }}
            >
              Biggest Challenge
            </h3>
            <p className="text-gray-700">{blocker}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
