import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title="Log In | Lansa – Jobs & CV Builder Curaçao"
        description="Log in to Lansa to manage your CV, track job applications and chat with employers in Curaçao."
        canonical="https://lansa.online/login"
      />
      <AuthLayout imageSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/21db5620684d4cbbfb27b61d5dfc0736c8a7cd9c?placeholderIfAbsent=true">
        <div className="w-full text-foreground font-normal text-center max-md:max-w-full">
          <h1 className="lx-page-title text-4xl md:text-5xl">
            {t('auth.titleWelcomeBack')}
          </h1>
          <p className="text-base md:text-lg mt-3 text-muted-foreground">
            {t('auth.subtitleLogin')}
          </p>
        </div>
        <div className="flex flex-col items-center w-full">
          <LoginForm onForgotPassword={() => navigate('/forgot-password')} />
          
          <div className="text-center mt-6">
            <button 
              onClick={() => navigate('/signup')}
              className="text-primary font-medium hover:underline focus:outline-none"
              data-testid="toggle-auth-mode"
            >
              {t('auth.toggleToSignup')}
            </button>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
