
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

export default function IndexPage() {
  const [isLogin, setIsLogin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if we need to show login form (e.g., after registration)
  useEffect(() => {
    // If we have a query param to show login, use it
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'true') {
      setIsLogin(true);
    }
    
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [location, user, navigate]);

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
            data-login-tab={isLogin ? "false" : "true"}
          >
            {isLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
