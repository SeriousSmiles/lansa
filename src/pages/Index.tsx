import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";

type AuthMode = 'login' | 'signup';

export default function IndexPage() {
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const { t } = useTranslation();

  useEffect(() => {
    const mode = searchParams.get('mode');
    console.log('Auth page mode:', mode);
    if (mode === 'signup') {
      setAuthMode('signup');
    } else {
      setAuthMode('login');
    }
  }, [searchParams]);

  return (
    <>
      <SEOHead
        title="Lansa - AI-Powered Professional Profile Builder | Transform Your Career"
        description="Join thousands building better careers with Lansa's AI-powered professional profile builder. Get personalized career insights, create compelling profiles, and connect with opportunities that match your goals."
        keywords="professional profile builder, AI career coach, career development, resume builder, job search platform, professional networking, career insights, profile optimization"
        canonical="https://lansa.online/"
      />
      <AuthLayout imageSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/21db5620684d4cbbfb27b61d5dfc0736c8a7cd9c?placeholderIfAbsent=true">
        <div className="w-full text-foreground font-normal text-center max-md:max-w-full mb-8">
          <h1 className="text-5xl leading-[1.2] tracking-[-0.48px] max-md:max-w-full max-md:text-[40px]">
            {authMode === 'login' ? t('auth.titleWelcomeBack') : t('auth.titleSignup')}
          </h1>
          <p className="text-lg mt-6 max-md:max-w-full">
            {authMode === 'login' ? t('auth.subtitleLogin') : t('auth.subtitleSignup')}
          </p>
        </div>

        <div className="flex flex-col items-center w-full">
          {authMode === 'login' ? (
            <SignIn 
              routing="path"
              path="/auth"
              signUpUrl="/auth?mode=signup"
              redirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full max-w-md",
                  card: "shadow-none border-0 bg-transparent",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                }
              }}
            />
          ) : (
            <SignUp 
              routing="path"
              path="/auth"
              signInUrl="/auth?mode=login"
              redirectUrl="/onboarding"
              appearance={{
                elements: {
                  rootBox: "w-full max-w-md",
                  card: "shadow-none border-0 bg-transparent",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                }
              }}
            />
          )}
          
          <div className="text-center mt-6">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-primary font-medium hover:underline focus:outline-none"
              data-testid="toggle-auth-mode"
            >
              {authMode === 'login' ? t('auth.toggleToSignup') : t('auth.toggleToLogin')}
            </button>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
