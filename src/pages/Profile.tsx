
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getUserAnswers, getProfileRole, getProfileGoal } from "@/services/QuestionService";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [userName, setUserName] = useState<string>("Lansa User");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      
      const answers = await getUserAnswers(user.id);
      if (answers) {
        setUserAnswers(answers);
      }
      
      // In a real app, you would fetch the user's name from their profile
      // For now we'll use a placeholder
      if (user.email) {
        setUserName(user.email.split('@')[0]);
      }
      
      setIsLoading(false);
    }
    
    loadProfile();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E]">Loading your profile...</div>
      </div>
    );
  }

  const role = getProfileRole(userAnswers?.question1);
  const goal = getProfileGoal(userAnswers?.question3);
  const blocker = userAnswers?.question2 || "Identifying my unique value proposition";

  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
      <header className="flex min-h-[72px] w-full px-16 items-center max-md:px-5">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
          alt="Lansa Logo"
          className="aspect-[2.7] object-contain w-[92px]"
        />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[700px]">
          <h1 className="text-4xl font-semibold text-[#2E2E2E] mb-2 text-center">Your Starter Profile</h1>
          <p className="text-center text-[#2E2E2E] mb-6">Based on your onboarding answers. This is just the beginning of your clarity journey.</p>
          
          <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
            <div className="flex items-center mb-8">
              <div className="w-20 h-20 bg-[#FF6B4A] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="ml-6">
                <h2 className="text-3xl font-bold text-[#2E2E2E]">{userName}</h2>
                <p className="text-xl text-[#2E2E2E] opacity-80">{role}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm uppercase text-gray-500 mb-2">Goal</h3>
              <p className="text-xl text-[#2E2E2E]">{goal}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm uppercase text-gray-500 mb-2">Biggest Challenge</h3>
              <blockquote className="border-l-4 border-[#FF6B4A] pl-4 italic text-xl text-[#2E2E2E]">
                "{blocker}"
              </blockquote>
            </div>
            
            <div>
              <h3 className="text-sm uppercase text-gray-500 mb-2">Next Steps</h3>
              <p className="text-[#2E2E2E]">
                Based on your responses, we recommend focusing on clarity of communication first. 
                Check back soon for personalized resources and exercises to help you achieve your goal.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="px-8 py-6 h-auto text-lg"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        © 2025 Lansa
      </footer>
    </div>
  );
}
