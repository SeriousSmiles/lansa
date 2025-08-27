import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
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

      // Sign up user with email and password
      const { error, data: authData } = await signUp(data.email, data.password);
      if (error) {
        toast.error(error.message || "Failed to sign up");
        setIsLoading(false);
        return;
      }

      // Save user profile information
      if (authData?.user?.id) {
        try {
          // Store name in local storage temporarily to use on first login
          localStorage.setItem('userName', fullName);

          // Check if profile exists first
          const {
            data: existingProfile
          } = await supabase.from('user_profiles').select('user_id').eq('user_id', authData.user.id).maybeSingle();
          if (existingProfile) {
            // Update existing profile
            await supabase.from('user_profiles').update({
              name: fullName
            }).eq('user_id', authData.user.id);
          } else {
            // Create new profile
            await supabase.from('user_profiles').insert({
              user_id: authData.user.id,
              name: fullName
            });
          }
          console.log("Saved user profile information with name:", fullName);
        } catch (profileError) {
          console.error("Error saving profile:", profileError);
          // Don't block the sign-up flow if profile save fails
        }
      }
      toast.success("Account created successfully! Please log in.");

      // Add a small delay before redirecting to ensure toast is seen
      setTimeout(() => {
        // Switch to login page by toggling isLogin in parent component
        // Fix: Properly type the button element as HTMLButtonElement
        const toggleButton = document.querySelector('button[data-testid="toggle-auth-mode"]') as HTMLButtonElement | null;
        if (toggleButton) {
          // Use the button if it exists
          toggleButton.click();
        } else {
          // Fallback to direct navigation
          navigate("/auth");
        }
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred during sign up");
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
        <Input 
          type="password" 
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
        <Input
          type="password"
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
            onClick={() => console.log("Google signup is not implemented in this MVP")}
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/abebc497af7ae0216b313acd82c8ed74ee2d8b24?placeholderIfAbsent=true"
              alt="Google"
              className="w-6 h-6 mr-3"
            />
            Sign up with Google (Coming Soon)
          </Button>
        </div>
      </div>
    </form>;
}