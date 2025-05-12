
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, Users, CalendarDays, Briefcase, 
  Award, Star, Lightbulb, Rocket, Check 
} from "lucide-react";

interface QuestionCardProps {
  question: string;
  options: string[];
  onAnswer: (answer: string) => void;
  isSubmitting: boolean;
  stepNumber: number;
  totalSteps: number;
}

export function QuestionCard({
  question,
  options,
  onAnswer,
  isSubmitting,
  stepNumber,
  totalSteps
}: QuestionCardProps) {
  // Map options to appropriate user types for badges
  const optionToBadgeMap: Record<string, string[]> = {
    // Gender badges
    "Male": ["all"],
    "Female": ["all"],
    "Prefer not to say": ["all"],
    "Prefer to self-describe": ["all"],
    
    // Age badges
    "Under 18": ["student"],
    "18–24": ["student", "job-seeker"],
    "25–34": ["job-seeker", "entrepreneur"],
    "35–44": ["entrepreneur", "freelancer"],
    "45–54": ["entrepreneur", "freelancer"],
    "55+": ["mentor", "visionary"],
    
    // Identity badges
    "Freelancer": ["freelancer"],
    "Job-seeker": ["job-seeker"],
    "Student": ["student"],
    "Entrepreneur": ["entrepreneur"],
    "Visionary": ["visionary"],
    
    // Outcome badges
    "Be taken seriously as a freelancer or creative professional": ["freelancer"],
    "Stand out and get hired for the kind of job I really want": ["job-seeker"],
    "Figure out what makes me different and valuable": ["student", "job-seeker"],
    "Turn my ideas into something clear and actionable": ["entrepreneur", "visionary"],
    "Finally feel confident about how I show up to others": ["all"],
  };
  
  // Map options to appropriate icons
  const getOptionIcon = (option: string) => {
    // Gender icons
    if (["Male", "Female", "Prefer not to say", "Prefer to self-describe"].includes(option)) {
      return <User size={32} className="mb-3 text-[#FF6B4A]" />;
    }
    
    // Age icons
    if (["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"].includes(option)) {
      return <CalendarDays size={32} className="mb-3 text-[#FF6B4A]" />;
    }
    
    // Identity icons
    if (["Freelancer", "Job-seeker", "Student", "Entrepreneur", "Visionary"].includes(option)) {
      return <Briefcase size={32} className="mb-3 text-[#FF6B4A]" />;
    }
    
    // Outcome icons
    if (option === "Be taken seriously as a freelancer or creative professional") {
      return <Award size={32} className="mb-3 text-[#FF6B4A]" />;
    }
    if (option === "Stand out and get hired for the kind of job I really want") {
      return <Star size={32} className="mb-3 text-[#FF6B4A]" />;
    }
    if (option === "Figure out what makes me different and valuable") {
      return <Lightbulb size={32} className="mb-3 text-[#FF6B4A]" />;
    }
    if (option === "Turn my ideas into something clear and actionable") {
      return <Rocket size={32} className="mb-3 text-[#FF6B4A]" />;
    }
    if (option === "Finally feel confident about how I show up to others") {
      return <Check size={32} className="mb-3 text-[#FF6B4A]" />;
    }
    
    // Default icon (should not reach here)
    return <Users size={32} className="mb-3 text-[#FF6B4A]" />;
  };
  
  return (
    <div className="w-full">
      {/* Progress indicator */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index}
              className={`w-3 h-3 rounded-full ${
                index < stepNumber - 1
                  ? "bg-[#FF6B4A]" 
                  : index === stepNumber - 1
                    ? "border-2 border-[#FF6B4A]" 
                    : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Question */}
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#2E2E2E] mb-4">
          {question}
        </h1>
        <p className="text-[#5A5A5A] text-lg max-w-2xl">
          This helps us personalize your professional clarity journey.
        </p>
      </div>
      
      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option, index) => {
          const badgeTypes = optionToBadgeMap[option] || ["all"];
          
          return (
            <Card 
              key={index}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-[#FF6B4A] ${
                isSubmitting ? "opacity-70 pointer-events-none" : "hover:translate-y-[-4px]"
              }`}
              onClick={() => !isSubmitting && onAnswer(option)}
            >
              <div className="flex flex-col h-full p-6">
                {/* Icon */}
                <div className="flex items-center justify-center w-full">
                  {getOptionIcon(option)}
                </div>
                
                <div className="flex flex-col flex-grow">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {badgeTypes.map(type => (
                      <Badge 
                        key={type} 
                        variant={
                          type === "freelancer" ? "default" : 
                          type === "job-seeker" ? "secondary" :
                          type === "student" ? "outline" :
                          type === "all" ? "default" :
                          "destructive"
                        }
                        className="w-fit px-3 py-1 text-left bg-[#FDE1D3] text-[#ea384c] hover:bg-[#FDE1D3] hover:text-[#ea384c] border-0"
                      >
                        {type !== "all" ? `Perfect for ${type}` : "For everyone"}
                      </Badge>
                    ))}
                  </div>
                  
                  <p className="flex-grow mb-0 text-[#2E2E2E] text-left text-xl font-medium">
                    {option}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

