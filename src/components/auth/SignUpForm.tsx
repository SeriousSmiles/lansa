import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
export function SignUpForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<SignUpFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");
  const { validation, passwordsMatch } = usePasswordValidation(password, confirmPassword);
  const onSubmit = async (data: SignUpFormData) => {
    if (!validation.isValid) {
      toast.error("Please ensure your password meets all requirements");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const fullName = `${data.firstName} ${data.lastName}`;

      // Sign up user with metadata - the database trigger will handle profile creation
      const { error } = await signUp(data.email, data.password, {
        first_name: data.firstName,
        last_name: data.lastName,
        full_name: fullName
      });
      
      if (error) {
        toast.error(error.message || "Failed to sign up");
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully! Please check your email to confirm your account. Once confirmed, you'll be automatically signed in.");
      setIsLoading(false);
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      toast.error(error.message || "An error occurred during sign up");
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        toast.error(error.message || "An error occurred during Google signup");
        setIsLoading(false);
      }
      // Note: If successful, the user will be redirected by Google, so no need to handle success here
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      toast.error(error.message || "An error occurred during Google signup");
      setIsLoading(false);
    }
  };
  return <form onSubmit={handleSubmit(onSubmit)} className="flex w-[480px] max-w-full flex-col items-center text-base justify-center mt-8 mx-auto">
      <div className="w-full grid grid-cols-2 gap-4">
        <div className="text-foreground font-normal">
          <label className="block mb-2">First Name*</label>
          <Input 
            {...register("firstName", { required: true })} 
            error={!!errors.firstName} 
            disabled={isLoading} 
            placeholder="Enter first name"
          />
        </div>

        <div className="text-foreground font-normal">
          <label className="block mb-2">Last Name*</label>
          <Input 
            {...register("lastName", { required: true })} 
            error={!!errors.lastName} 
            disabled={isLoading} 
            placeholder="Enter last name"
          />
        </div>
      </div>

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
        <label className="block mb-2">Password*</label>
        <PasswordInput 
          autoComplete="new-password" 
          {...register("password", { required: true })} 
          error={!!errors.password || (password.length > 0 && !validation.isValid)} 
          disabled={isLoading}
          placeholder="Enter password"
        />
        {password.length > 0 && (
          <div className="mt-3">
            <PasswordStrengthIndicator validation={validation} />
          </div>
        )}
      </div>

      <div className="w-full text-foreground font-normal mt-6">
        <label className="block mb-2">Confirm Password*</label>
        <PasswordInput
          autoComplete="new-password"
          {...register("confirmPassword", { required: true })}
          error={!!errors.confirmPassword || (confirmPassword.length > 0 && !passwordsMatch)}
          disabled={isLoading}
          placeholder="Confirm password"
        />
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-destructive text-sm mt-1">Passwords do not match</p>
        )}
      </div>

      <div className="flex w-full flex-col items-center mt-6">
        <div className="w-full text-white font-medium">
          <Button
            type="submit"
            disabled={isLoading || !validation.isValid || !passwordsMatch}
            className={cn(
              "w-full",
              (!validation.isValid || !passwordsMatch) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>

          <Button
            type="button"
            variant="google"
            disabled={isLoading}
            className="mt-4 w-full"
            onClick={handleGoogleSignUp}
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/abebc497af7ae0216b313acd82c8ed74ee2d8b24?placeholderIfAbsent=true"
              alt="Google"
              className="w-6 h-6 mr-3"
            />
            Sign up with Google
          </Button>
        </div>
      </div>
    </form>;
}