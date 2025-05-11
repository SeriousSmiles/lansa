
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { questions, saveUserAnswers } from "@/services/QuestionService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Map question options to appropriate user types for badges
const optionToBadgeMap: Record<string, string[]> = {
  "I want to get noticed and valued as a freelancer": ["freelancer"],
  "I'm trying to find a job that fits me": ["job-seeker"],
  "I want more clarity for my business/idea": ["entrepreneur"],
  "I'm preparing for my next move as a student": ["student"],
  "I'm not sure — I just know I want more": ["all"],
  
  "I'm unclear how to talk about myself": ["freelancer", "job-seeker"],
  "I feel invisible in my industry": ["freelancer", "entrepreneur"],
  "I don't know what steps to take": ["student", "entrepreneur"],
  "I'm afraid I'll be misunderstood or ignored": ["all"],
  "I've tried, but nothing stuck": ["all"],
  
  "People understand what I do clearly": ["freelancer", "entrepreneur"],
  "I have a solid online presence/profile": ["freelancer", "job-seeker"],
  "I've figured out what I really want": ["student", "job-seeker"],
  "I'm getting more serious interest or responses": ["freelancer", "job-seeker"],
  "I've taken real steps I'm proud of": ["all"]
};

// Map questions to clarifying text
const questionDetails = [
  {
    id: "question1",
    clarifyingText: "Your motivation matters. Understanding why you're here helps us tailor your path to clarity.",
  },
  {
    id: "question2",
    clarifyingText: "Identifying your biggest challenge is the first step to overcoming it.",
  },
  {
    id: "question3",
    clarifyingText: "Your short-term goals help us create an achievable roadmap for your success.",
  }
];

// Array of placeholder image URLs to use for cards
const placeholderImages = [
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80"
];

export default function Onboarding() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleAnswer = async (answer: string) => {
    const questionId = questions[currentQuestion].id;
    const updatedAnswers = { ...answers, [questionId]: answer };
    setAnswers(updatedAnswers);

    // If this is the last question, save and navigate to results
    if (currentQuestion === questions.length - 1) {
      try {
        if (!user?.id) {
          toast.error("User not authenticated");
          return;
        }
        
        await saveUserAnswers(user.id, updatedAnswers);
        navigate("/result");
      } catch (error) {
        console.error("Failed to save answers:", error);
        toast.error("Failed to save your answers. Please try again.");
      }
    } else {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const currentQ = questions[currentQuestion];
  const currentDetail = questionDetails.find(q => q.id === currentQ.id);

  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
      <header className="flex min-h-[72px] w-full px-6 md:px-16 items-center justify-between">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
          alt="Lansa Logo"
          className="aspect-[2.7] object-contain w-[92px]"
        />
        
        <div className="flex gap-2">
          {questions.map((_, index) => (
            <div 
              key={index}
              className={`w-3 h-3 rounded-full ${
                index < currentQuestion 
                  ? "bg-[#FF6B4A]" 
                  : index === currentQuestion 
                    ? "border-2 border-[#FF6B4A]" 
                    : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[800px]">
          <div className="flex flex-col items-center text-center mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-[48px] font-semibold text-[#2E2E2E] mb-4">{currentQ.question}</h1>
            <p className="text-[#5A5A5A] text-lg max-w-2xl">{currentDetail?.clarifyingText}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentQ.options.map((option, index) => {
              const badgeTypes = optionToBadgeMap[option] || ["all"];
              const imageIndex = index % placeholderImages.length;
              
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col h-full">
                    {/* Image area at the top */}
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
                              "destructive"
                            }
                            className="w-fit px-3 py-1 text-left bg-[#FDE1D3] text-[#ea384c] hover:bg-[#FDE1D3] hover:text-[#ea384c] border-0"
                          >
                            Perfect for {type}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="flex-grow mb-5 text-[#2E2E2E] text-left text-xl font-medium">{option}</p>
                      
                      <Button 
                        onClick={() => handleAnswer(option)}
                        className="w-full mt-auto bg-[#FF6B4A] hover:bg-[#FF6B4A]/90 text-white rounded-lg py-3"
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        © 2025 Lansa
      </footer>
    </div>
  );
}
