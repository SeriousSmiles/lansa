
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

export function SignUpForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      // Store name in metadata
      const { error } = await signUp(data.email, data.password);
      
      if (error) {
        toast.error(error.message || "Failed to sign up");
        return;
      }
      
      // Save the user's name to Supabase when profile tables are set up
      // This happens after email verification in a real app
      
      toast.success("Account created successfully!");
      navigate("/onboarding");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-[480px] max-w-full flex-col items-center text-base justify-center mt-8 mx-auto">
      <div className="w-full text-[#2E2E2E] font-normal">
        <label className="block mb-2">Name*</label>
        <Input
          {...register("name", { required: true })}
          error={!!errors.name}
          disabled={isLoading}
        />
      </div>

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
            Sign up
          </Button>

          <Button
            type="button"
            variant="google"
            disabled={isLoading}
            className="mt-4"
            onClick={() => toast.info("Google sign up is not implemented in this MVP")}
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
    </form>
  );
}
