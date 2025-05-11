
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone, Star } from "lucide-react";

interface ProfileSidebarProps {
  userName: string;
  role: string;
  email: string;
  skills: string[];
  goal: string;
}

export function ProfileSidebar({ userName, role, email, skills, goal }: ProfileSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-8">
      <Card className="overflow-hidden">
        <div className="bg-[#FF6B4A] h-24"></div>
        <div className="p-6 pt-0 -mt-12 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#FF6B4A] border-4 border-white flex items-center justify-center text-white text-4xl font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold mt-4 text-center">{userName}</h1>
          <p className="text-[#FF6B4A] font-medium text-center">{role}</p>
          
          <div className="w-full mt-6 space-y-4">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-[#FF6B4A] mr-3" />
              <span>{email || 'email@example.com'}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-[#FF6B4A] mr-3" />
              <span>Remote / Worldwide</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-[#FF6B4A] mr-3" />
              <span>Available on request</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Skills */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold flex items-center mb-4">
            <Star className="h-5 w-5 text-[#FF6B4A] mr-2" />
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <div key={index} className="bg-[#FFF4EE] text-[#FF6B4A] px-3 py-1 rounded-full">
                {skill}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Goals */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold flex items-center mb-4">
            <Star className="h-5 w-5 text-[#FF6B4A] mr-2" />
            Professional Goal
          </h2>
          <p className="text-lg">{goal}</p>
        </CardContent>
      </Card>
    </div>
  );
}
