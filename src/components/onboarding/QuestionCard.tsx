
import { Card } from "@/components/ui/card";
import { 
  User, CalendarDays, Briefcase, 
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
  // Map options to clarifying text for non-gender questions
  const optionToClarifyingText: Record<string, string> = {
    // Age clarifying text
    "Under 18": "Perfect for students exploring their early interests and skills",
    "18–24": "Ideal for those starting their career journey or academic path",
    "25–34": "Great for professionals establishing their career direction",
    "35–44": "For those advancing their career or pivoting to new opportunities",
    "45–54": "For seasoned professionals looking to leverage their expertise",
    "55+": "For experienced individuals sharing knowledge and pursuing passions",
    
    // Identity clarifying text
    "Freelancer": "Independent professionals seeking client recognition and growth",
    "Job-seeker": "Professionals looking for meaningful employment opportunities",
    "Student": "Learners developing skills and discovering their professional path",
    "Entrepreneur": "Business builders turning ideas into sustainable ventures",
    "Visionary": "Forward-thinkers with ambitious goals and innovative perspectives",
    
    // New simplified outcome clarifying text
    "Land the job I really want": "Stand out from other candidates and get noticed by the right employers",
    "Get recognition for my creative work": "Build credibility and attract opportunities in your creative field", 
    "Gain clarity on my professional direction": "Discover what makes you unique and where to focus your energy",
    "Attract better clients and opportunities": "Position yourself to work with ideal clients who value your expertise",
    "Build confidence in how I present myself": "Present yourself authentically and powerfully in any professional setting",
    
    // Legacy outcome clarifying text - keeping for backward compatibility
    "Be taken seriously as a freelancer or creative professional": "Establish credibility and attract quality clients in your niche",
    "Stand out and get hired for the kind of job I really want": "Differentiate yourself from other candidates in competitive markets",
    "Figure out what makes me different and valuable": "Discover and articulate your unique professional strengths",
    "Turn my ideas into something clear and actionable": "Transform abstract concepts into concrete plans and results",
    "Finally feel confident about how I show up to others": "Present yourself authentically and powerfully in professional settings",
  };
  
  // Map options to appropriate icons
  const getOptionIcon = (option: string) => {
    // Gender icons
    if (["Male", "Female"].includes(option)) {
      return <User size={24} className="text-white" />;
    }
    
    // Age icons
    if (["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"].includes(option)) {
      return <CalendarDays size={24} className="text-white" />;
    }
    
    // Identity icons
    if (["Freelancer", "Job-seeker", "Student", "Entrepreneur", "Visionary", "Creative Professional"].includes(option)) {
      return <Briefcase size={24} className="text-white" />;
    }
    
    // New simplified outcome icons
    if (option === "Land the job I really want") {
      return <Star size={24} className="text-white" />;
    }
    if (option === "Get recognition for my creative work") {
      return <Award size={24} className="text-white" />;
    }
    if (option === "Gain clarity on my professional direction") {
      return <Lightbulb size={24} className="text-white" />;
    }
    if (option === "Attract better clients and opportunities") {
      return <Rocket size={24} className="text-white" />;
    }
    if (option === "Build confidence in how I present myself") {
      return <Check size={24} className="text-white" />;
    }
    
    // Legacy outcome icons - keeping for backward compatibility
    if (option === "Be taken seriously as a freelancer or creative professional") {
      return <Award size={24} className="text-white" />;
    }
    if (option === "Stand out and get hired for the kind of job I really want") {
      return <Star size={24} className="text-white" />;
    }
    if (option === "Figure out what makes me different and valuable") {
      return <Lightbulb size={24} className="text-white" />;
    }
    if (option === "Turn my ideas into something clear and actionable") {
      return <Rocket size={24} className="text-white" />;
    }
    if (option === "Finally feel confident about how I show up to others") {
      return <Check size={24} className="text-white" />;
    }
    
    return <User size={24} className="text-white" />;
  };
  
  // Filter out non-binary gender options if this is a gender question
  const isGenderQuestion = options.some(opt => opt === "Male" || opt === "Female");
  const filteredOptions = isGenderQuestion 
    ? options.filter(opt => opt === "Male" || opt === "Female") 
    : options;

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
        {filteredOptions.map((option, index) => {
          const clarifyingText = optionToClarifyingText[option] || "";
          const isGenderOption = option === "Male" || option === "Female";
          
          return (
            <Card 
              key={index}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-[#FF6B4A] ${
                isSubmitting ? "opacity-70 pointer-events-none" : "hover:translate-y-[-4px]"
              }`}
              onClick={() => !isSubmitting && onAnswer(option)}
            >
              <div className="flex flex-col h-full p-6">
                {/* Icon with colored background, aligned left */}
                <div className="flex items-start mb-4">
                  <div className="flex items-center justify-center bg-[#FF6B4A] p-2 rounded-md">
                    {getOptionIcon(option)}
                  </div>
                </div>
                
                <div className="flex flex-col flex-grow">
                  <p className="text-[#2E2E2E] text-left text-xl font-medium mb-2">
                    {option}
                  </p>
                  
                  {/* Display clarifying text for non-gender options */}
                  {!isGenderOption && clarifyingText && (
                    <p className="text-[#5A5A5A] text-sm text-left">
                      {clarifyingText}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
