
import { Card } from "@/components/ui/card";

interface SharedProfileSidebarProps {
  userName: string;
  role: string;
  goal: string;
  userSkills: string[];
  profileImage: string;
  coverColor?: string;
  highlightColor?: string;
}

export function SharedProfileSidebar({
  userName,
  role,
  goal,
  userSkills,
  profileImage,
  coverColor = "#1A1F71",
  highlightColor = "#FF6B4A",
}: SharedProfileSidebarProps) {
  // Calculate color contrast for text readability
  const getContrastTextColor = (hexColor: string): string => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  return (
    <div className="lg:col-span-4 space-y-4">
      <Card className="bg-white rounded-xl p-6 shadow">
        <div className="text-2xl font-semibold mb-4">{userName}</div>
        <div 
          className="text-gray-600 mb-2"
          style={{ color: coverColor }}
        >
          {role}
        </div>
        
        {profileImage && (
          <div className="mb-4">
            <img 
              src={profileImage} 
              alt={`${userName}'s profile`}
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow" 
              style={{ borderColor: `${coverColor}30` }}
            />
          </div>
        )}
        
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
        
        {/* Goal */}
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
      </Card>
    </div>
  );
}
