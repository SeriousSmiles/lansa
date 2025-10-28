import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Reset Password - Lansa | AI-Powered Professional Profile Builder"
        description="Reset your Lansa account password to regain access to your professional profile and career tools."
        canonical="https://lansa.online/forgot-password"
        noindex
      />
      <AuthLayout imageSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/21db5620684d4cbbfb27b61d5dfc0736c8a7cd9c?placeholderIfAbsent=true">
        <div className="w-full text-foreground font-normal text-center max-md:max-w-full">
          <h1 className="text-5xl leading-[1.2] tracking-[-0.48px] max-md:max-w-full max-md:text-[40px]">
            Reset Password
          </h1>
          <p className="text-lg mt-6 max-md:max-w-full">
            Enter your email to receive a password reset link
          </p>
        </div>
        <div className="flex flex-col items-center w-full">
          <ForgotPasswordForm onBack={() => navigate('/login')} />
        </div>
      </AuthLayout>
    </>
  );
}
