
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  getUserAnswers, 
  saveUserAnswers
} from "@/services/question";
import { UserTypeSelection } from "@/components/onboarding/UserTypeSelection";
import { BusinessOnboardingForm } from "@/components/onboarding/BusinessOnboardingForm";
import { StudentOnboardingContainer } from "@/components/onboarding/student/StudentOnboardingContainer";
import EnhancedOnboardingForm from "@/components/onboarding/EnhancedOnboardingForm";

export default function Onboarding() {
  const [isLoading, setIsLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<any>({});
  const [userType, setUserType] = useState<'job_seeker' | 'employer' | null>(null);
  const [showTypeSelection, setShowTypeSelection] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUserAnswers() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const answers = await getUserAnswers(user.id);
        console.log("Loaded existing user answers:", answers);
        
        if (answers) {
          setUserAnswers(answers);
          
          // If user has already completed onboarding, redirect to dashboard
          if (answers.onboarding_completed) {
            navigate('/dashboard');
            return;
          }
          
          // Check if user has already selected a type
          if (answers.user_type) {
            setUserType(answers.user_type);
            setShowTypeSelection(false);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading user answers:", error);
        toast.error("Failed to load your data. Please try again later.");
        setIsLoading(false);
      }
    }
    
    loadUserAnswers();
  }, [user]);

  const handleUserTypeSelect = (selectedType: 'job_seeker' | 'employer') => {
    setUserType(selectedType);
    setShowTypeSelection(false);
  };

  const handleSaveAnswers = async (userId: string, answers: any) => {
    try {
      const answersWithType = { ...answers, user_type: userType };
      const result = await saveUserAnswers(userId, answersWithType);
      if (!result.success) {
        toast.error("Failed to save your answers. Please try again.");
        return { success: false };
      }
      return result;
    } catch (error) {
      console.error("Error in save answers handler:", error);
      toast.error("Failed to save your answers. Please try again.");
      return { success: false };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E]">Setting up your onboarding experience...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
      <header className="flex min-h-[72px] w-full px-6 md:px-16 items-center justify-between">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
          alt="Lansa Logo"
          className="aspect-[2.7] object-contain w-[92px]"
        />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {showTypeSelection ? (
          <UserTypeSelection onSelect={handleUserTypeSelect} />
        ) : userType === 'employer' ? (
          <BusinessOnboardingForm onComplete={() => navigate('/dashboard')} />
        ) : (
          <StudentOnboardingContainer />
        )}
      </main>

      <footer className="text-center py-6 text-sm text-[#1A1F71]">
        © 2025 Lansa
      </footer>
    </div>
  );
}
