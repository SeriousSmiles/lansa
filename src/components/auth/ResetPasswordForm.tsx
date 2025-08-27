import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ResetPasswordFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");
  const { validation, passwordsMatch } = usePasswordValidation(password, confirmPassword);

  const onSubmit = async (data: ResetPasswordFormData) => {
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
      const { error } = await updatePassword(data.password);
      if (error) {
        toast.error(error.message || "Failed to update password");
      } else {
        toast.success("Password updated successfully!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-[480px] max-w-full flex-col items-center text-base justify-center mt-8 mx-auto">
      <div className="w-full text-foreground font-normal">
        <label className="block mb-2">New Password*</label>
        <Input
          type="password"
          {...register("password", { required: true })}
          error={!!errors.password || (password.length > 0 && !validation.isValid)}
          disabled={isLoading}
          placeholder="Enter new password"
        />
        {password.length > 0 && (
          <div className="mt-3">
            <PasswordStrengthIndicator validation={validation} />
          </div>
        )}
      </div>

      <div className="w-full text-foreground font-normal mt-6">
        <label className="block mb-2">Confirm New Password*</label>
        <Input
          type="password"
          {...register("confirmPassword", { required: true })}
          error={!!errors.confirmPassword || (confirmPassword.length > 0 && !passwordsMatch)}
          disabled={isLoading}
          placeholder="Confirm new password"
        />
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-destructive text-sm mt-1">Passwords do not match</p>
        )}
      </div>

      <div className="flex w-full flex-col items-center mt-6">
        <Button
          type="submit"
          disabled={isLoading || !validation.isValid || !passwordsMatch}
          className={cn(
            "w-full",
            (!validation.isValid || !passwordsMatch) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? 'Updating Password...' : 'Update Password'}
        </Button>
      </div>
    </form>
  );
}