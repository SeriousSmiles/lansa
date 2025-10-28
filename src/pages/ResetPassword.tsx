import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { SEOHead } from "@/components/SEOHead";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'reset') {
      setIsValidToken(true);
    }
  }, [searchParams]);

  return (
    <>
      <SEOHead
        title="Set New Password - Lansa | AI-Powered Professional Profile Builder"
        description="Set a new password for your Lansa account."
        canonical="https://lansa.online/reset-password"
        noindex
      />
      <AuthLayout imageSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/21db5620684d4cbbfb27b61d5dfc0736c8a7cd9c?placeholderIfAbsent=true">
        <div className="w-full text-foreground font-normal text-center max-md:max-w-full">
          <h1 className="text-5xl leading-[1.2] tracking-[-0.48px] max-md:max-w-full max-md:text-[40px]">
            Set New Password
          </h1>
          <p className="text-lg mt-6 max-md:max-w-full">
            Enter your new password below
          </p>
        </div>
        <div className="flex flex-col items-center w-full">
          {isValidToken ? (
            <ResetPasswordForm />
          ) : (
            <div className="text-center text-muted-foreground">
              Invalid or expired reset link. Please request a new one.
            </div>
          )}
        </div>
      </AuthLayout>
    </>
  );
}
