
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnswers, hasCompletedOnboarding } from "@/services/question";
import { supabase } from "@/integrations/supabase/client";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onForgotPassword: () => void;
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user just signed up
  const urlParams = new URLSearchParams(location.search);
  const fromSignup = urlParams.get('from') === 'signup';

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

      // Failsafe: if session missing, just send to onboarding
      if (!session?.user?.id) {
        navigate('/onboarding', { replace: true });
        return;
      }

      // Check if user has completed onboarding and get user type
      const userAnswers = await getUserAnswers(session.user.id);
      const onboardingCompleted = hasCompletedOnboarding(userAnswers);
      const userType = userAnswers?.user_type as 'job_seeker' | 'employer' | undefined;

      if (onboardingCompleted && userType) {
        // Redirect to appropriate dashboard based on user type
        const destination = userType === 'employer' ? '/employer-dashboard' : '/dashboard';
        navigate(destination, { replace: true, state: { fromRedirect: true } });
      } else {
        navigate('/onboarding', { replace: true, state: { fromRedirect: true } });
      }
      
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      setLoginError(error.message || "An error occurred during login");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setLoginError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        setLoginError(error.message || "An error occurred during Google login");
        setIsLoading(false);
      }
      // Note: If successful, the user will be redirected by Google, so no need to handle success here
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      setLoginError(error.message || "An error occurred during Google login");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-[480px] max-w-full flex-col items-center text-base justify-center mt-8 mx-auto">
      {fromSignup && (
        <Alert className="w-full mb-4 border-primary/20 bg-primary/5">
          <AlertDescription className="text-primary">
            Account created successfully! Please check your email (including junk/spam folder) to confirm your account before logging in.
          </AlertDescription>
        </Alert>
      )}
      
      {loginError && (
        <Alert variant="destructive" className="w-full mb-4">
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}
      
      <div className="w-full text-foreground font-normal mt-6">
        <label className="block mb-2">Email*</label>
        <Input
          type="email"
          {...register("email", { required: true })}
          error={!!errors.email}
          disabled={isLoading}
          placeholder="Enter email address"
        />
      </div>

      <div className="w-full text-foreground font-normal mt-6">
        <div className="flex justify-between items-center mb-2">
          <label>Password*</label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-primary text-sm hover:underline focus:outline-none"
          >
            Forgot password?
          </button>
        </div>
        <PasswordInput
          autoComplete="current-password"
          {...register("password", { required: true })}
          error={!!errors.password}
          disabled={isLoading}
          placeholder="Enter password"
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
            className="mt-4 w-full"
            onClick={handleGoogleLogin}
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
