import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";

export default function SignupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title="Sign Up - Lansa | AI-Powered Professional Profile Builder"
        description="Create your Lansa account and start building your professional profile with AI-powered insights and career opportunities."
        canonical="https://lansa.online/signup"
      />
      <AuthLayout imageSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/21db5620684d4cbbfb27b61d5dfc0736c8a7cd9c?placeholderIfAbsent=true">
        <div className="w-full text-foreground font-normal text-center max-md:max-w-full">
          <h1 className="text-5xl leading-[1.2] tracking-[-0.48px] max-md:max-w-full max-md:text-[40px]">
            {t('auth.titleSignup')}
          </h1>
          <p className="text-lg mt-6 max-md:max-w-full">
            {t('auth.subtitleSignup')}
          </p>
        </div>
        <div className="flex flex-col items-center w-full">
          <SignUpForm />
          
          <div className="text-center mt-6">
            <button 
              onClick={() => navigate('/login')}
              className="text-primary font-medium hover:underline focus:outline-none"
              data-testid="toggle-auth-mode"
            >
              {t('auth.toggleToLogin')}
            </button>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
