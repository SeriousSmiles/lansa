import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { LoginForm } from "@/components/auth/LoginForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useTranslation } from "react-i18next";

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

export default function IndexPage() {
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const { t } = useTranslation();

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'reset') {
      setAuthMode('reset-password');
    }
  }, [searchParams]);

  return (
    <AuthLayout imageSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/21db5620684d4cbbfb27b61d5dfc0736c8a7cd9c?placeholderIfAbsent=true">
      <div className="w-full text-foreground font-normal text-center max-md:max-w-full">
        <h1 className="text-5xl leading-[1.2] tracking-[-0.48px] max-md:max-w-full max-md:text-[40px]">
          {authMode === 'login' && t('auth.titleWelcomeBack')}
          {authMode === 'signup' && t('auth.titleSignup')}
          {authMode === 'forgot-password' && 'Reset Password'}
          {authMode === 'reset-password' && 'Set New Password'}
        </h1>
        <p className="text-lg mt-6 max-md:max-w-full">
          {authMode === 'login' && t('auth.subtitleLogin')}
          {authMode === 'signup' && t('auth.subtitleSignup')}
          {authMode === 'forgot-password' && 'Enter your email to receive a password reset link'}
          {authMode === 'reset-password' && 'Enter your new password below'}
        </p>
      </div>
      <div className="flex flex-col items-center w-full">
        {authMode === 'login' && <LoginForm onForgotPassword={() => setAuthMode('forgot-password')} />}
        {authMode === 'signup' && <SignUpForm />}
        {authMode === 'forgot-password' && <ForgotPasswordForm onBack={() => setAuthMode('login')} />}
        {authMode === 'reset-password' && <ResetPasswordForm />}
        
        {(authMode === 'login' || authMode === 'signup') && (
          <div className="text-center mt-6">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-primary font-medium hover:underline focus:outline-none"
              data-testid="toggle-auth-mode"
            >
              {authMode === 'login' ? t('auth.toggleToSignup') : t('auth.toggleToLogin')}
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
