
import { Card } from "@/components/ui/card";

interface SharedProfileSidebarProps {
  userName: string;
  role: string;
  goal: string;
  userSkills: string[];
  profileImage: string;
}

export function SharedProfileSidebar({
  userName,
  role,
  goal,
  userSkills,
  profileImage,
}: SharedProfileSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-4">
      <Card className="bg-white rounded-xl p-6 shadow">
        <div className="text-2xl font-semibold mb-4">{userName}</div>
        <div className="text-gray-600 mb-2">{role}</div>
        
        {profileImage && (
          <div className="mb-4">
            <img 
              src={profileImage} 
              alt={`${userName}'s profile`}
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow" 
            />
          </div>
        )}
        
        {/* Skills */}
        {userSkills.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {userSkills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-[#f2f2f2] text-[#333] px-3 py-1 rounded-full text-sm"
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
            <h3 className="font-semibold text-lg mb-2">Professional Goal</h3>
            <p className="text-gray-700">{goal}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
