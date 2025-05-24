
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/question";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (data: LoginFormData) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        toast.error(error.message || "Invalid login credentials");
        setIsLoading(false);
        return;
      }
      
      toast.success("Login successful!");
      
      // Get the current session to check user ID
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        // Check if user has completed onboarding
        const userAnswers = await getUserAnswers(session.user.id);
        const onboardingCompleted = hasCompletedOnboarding(userAnswers);
        
        if (onboardingCompleted) {
          // User has completed onboarding, go to dashboard
          navigate('/dashboard', { replace: true });
        } else {
          // User hasn't completed onboarding, go to onboarding
          navigate('/onboarding', { replace: true });
        }
      } else {
        // Fallback to onboarding if we can't determine status
        navigate('/onboarding', { replace: true });
      }
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred during login");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-[480px] max-w-full flex-col items-center text-base justify-center mt-8 mx-auto">
      <div className="w-full text-[#2E2E2E] font-normal mt-6">
        <label className="block mb-2">Email*</label>
        <Input
          type="email"
          {...register("email", { required: true })}
          error={!!errors.email}
          disabled={isLoading}
        />
      </div>

      <div className="w-full text-[#2E2E2E] font-normal mt-6">
        <label className="block mb-2">Password*</label>
        <Input
          type="password"
          {...register("password", { required: true })}
          error={!!errors.password}
          disabled={isLoading}
        />
      </div>

      <div className="flex w-full flex-col items-center mt-6">
        <div className="w-full text-white font-medium">
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>

          <Button
            type="button"
            variant="google"
            disabled={isLoading}
            className="mt-4"
            onClick={() => toast.info("Google login is not implemented in this MVP")}
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/abebc497af7ae0216b313acd82c8ed74ee2d8b24?placeholderIfAbsent=true"
              alt="Google"
              className="w-6 h-6 mr-3"
            />
            Log In with Google
          </Button>
        </div>
      </div>
    </form>
  );
}
