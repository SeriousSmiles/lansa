import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase } from "lucide-react";

interface UserTypeSelectionProps {
  onSelect: (userType: 'job_seeker' | 'employer') => void;
}

export function UserTypeSelection({ onSelect }: UserTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<'job_seeker' | 'employer' | null>(null);

  const handleSelect = (type: 'job_seeker' | 'employer') => {
    setSelectedType(type);
    setTimeout(() => onSelect(type), 300);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#2E2E2E] mb-4">
          What brings you to Lansa?
        </h2>
        <p className="text-lg text-[#666666]">
          Tell us how you plan to use Lansa so we can personalize your experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
            selectedType === 'job_seeker' 
              ? 'border-[#FF6B4A] bg-[#FF6B4A]/5' 
              : 'border-gray-200 hover:border-[#FF6B4A]/50'
          }`}
          onClick={() => handleSelect('job_seeker')}
        >
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#FF6B4A]/10 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-[#FF6B4A]" />
            </div>
            <h3 className="text-xl font-semibold text-[#2E2E2E] mb-3">
              Looking for Work
            </h3>
            <p className="text-[#666666] mb-6">
              Find your next career opportunity, connect with professionals, and grow your network
            </p>
            <div className="space-y-2 text-sm text-[#666666] text-left">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#FF6B4A] rounded-full"></div>
                <span>Browse job opportunities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#FF6B4A] rounded-full"></div>
                <span>Build your professional profile</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#FF6B4A] rounded-full"></div>
                <span>Connect with industry professionals</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
            selectedType === 'employer' 
              ? 'border-[#FF6B4A] bg-[#FF6B4A]/5' 
              : 'border-gray-200 hover:border-[#FF6B4A]/50'
          }`}
          onClick={() => handleSelect('employer')}
        >
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#FF6B4A]/10 rounded-full flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-[#FF6B4A]" />
            </div>
            <h3 className="text-xl font-semibold text-[#2E2E2E] mb-3">
              Looking to Hire
            </h3>
            <p className="text-[#666666] mb-6">
              Find top talent, post job listings, and build your team with AI-powered matching
            </p>
            <div className="space-y-2 text-sm text-[#666666] text-left">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#FF6B4A] rounded-full"></div>
                <span>Post job listings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#FF6B4A] rounded-full"></div>
                <span>AI-powered candidate matching</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#FF6B4A] rounded-full"></div>
                <span>Connect with qualified professionals</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8 text-sm text-[#666666]">
        You can always change this later in your settings
      </div>
    </div>
  );
}