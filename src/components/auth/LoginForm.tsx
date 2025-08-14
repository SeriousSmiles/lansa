
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/question";
import { supabase } from "@/integrations/supabase/client";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (data: LoginFormData) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setLoginError(null);
    
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        setLoginError(error.message || "Invalid login credentials");
        setIsLoading(false);
        return;
      }
      
      // Get the current session to check user ID
      const { data: { session } } = await supabase.auth.getSession();

      // Failsafe: if session missing, just send to /dashboard and let ProtectedRoute decide
      if (!session?.user?.id) {
        navigate('/dashboard', { replace: true });
        return;
      }

      // Check if user has completed onboarding
      const userAnswers = await getUserAnswers(session.user.id);
      const onboardingCompleted = hasCompletedOnboarding(userAnswers);

      if (onboardingCompleted) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
      
    } catch (error: any) {
      console.error(error);
      setLoginError(error.message || "An error occurred during login");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-[480px] max-w-full flex-col items-center text-base justify-center mt-8 mx-auto">
      {loginError && (
        <Alert variant="destructive" className="w-full mb-4">
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}
      
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
            className="w-full"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>

          <Button
            type="button"
            variant="google"
            disabled={isLoading}
            className="mt-4"
            onClick={() => console.log("Google login is not implemented in this MVP")}
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/abebc497af7ae0216b313acd82c8ed74ee2d8b24?placeholderIfAbsent=true"
              alt="Google"
              className="w-6 h-6 mr-3"
            />
            Log In with Google (Coming Soon)
          </Button>
        </div>
      </div>
    </form>
  );
}
