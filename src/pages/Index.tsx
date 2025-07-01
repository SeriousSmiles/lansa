
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { LoginForm } from "@/components/auth/LoginForm";

export default function IndexPage() {
  const [isLogin, setIsLogin] = useState(false);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure auth state is properly loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#FF6B4A] border-solid rounded-full border-t-transparent animate-spin mb-4"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout imageSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/21db5620684d4cbbfb27b61d5dfc0736c8a7cd9c?placeholderIfAbsent=true">
      <div className="w-full text-[#2E2E2E] font-normal text-center max-md:max-w-full">
        <h1 className="text-5xl leading-[1.2] tracking-[-0.48px] max-md:max-w-full max-md:text-[40px]">
          {isLogin ? "Welcome Back" : "Sign Up"}
        </h1>
        <p className="text-lg mt-6 max-md:max-w-full">
          {isLogin 
            ? "Good to see you again!" 
            : "Every journey of a thousand steps, started with one!"}
        </p>
      </div>
      <div className="flex flex-col items-center w-full">
        {isLogin ? <LoginForm /> : <SignUpForm />}
        <div className="text-center mt-6">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#FF6B4A] font-medium hover:underline focus:outline-none"
            data-testid="toggle-auth-mode"
          >
            {isLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
