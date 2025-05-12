
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { placeholderImages } from "@/utils/placeholderImages";

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
          const imageIndex = index % placeholderImages.length;
          
          return (
            <Card 
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => !isSubmitting && onAnswer(option)}
            >
              <div className="flex flex-col h-full">
                {/* Image area */}
                <div className="w-full h-36 overflow-hidden">
                  <img 
                    src={placeholderImages[imageIndex]} 
                    alt="Option illustration" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex flex-col gap-1 mb-3">
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
                  
                  <p className="flex-grow mb-5 text-[#2E2E2E] text-left text-xl font-medium">
                    {option}
                  </p>
                  
                  <Button 
                    onClick={() => !isSubmitting && onAnswer(option)}
                    disabled={isSubmitting}
                    className="w-full mt-auto bg-[#FF6B4A] hover:bg-[#FF6B4A]/90 text-white rounded-lg py-3"
                  >
                    {isSubmitting ? "Saving..." : "Select"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
