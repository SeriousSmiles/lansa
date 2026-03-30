import { useNavigate } from "react-router-dom";
import lansaLogo from "@/assets/lansa-logo-blue.png";

export const LandingFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-foreground py-12 md:py-16">
      <div className="mx-auto max-w-[1440px] px-[5%]">
        <div className="flex flex-col items-center gap-8 text-center">
          <img src={lansaLogo} alt="Lansa" className="h-7 brightness-0 invert" />
          <p className="text-sm text-white/60 font-public-sans max-w-md">
            Empowering Caribbean professionals to build careers they're proud
            of — with AI, certifications, and real connections.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-public-sans">
            <button onClick={() => navigate("/pricing")} className="text-white/50 hover:text-white/80 transition-colors">
              Pricing
            </button>
            <button onClick={() => navigate("/for-business")} className="text-white/50 hover:text-white/80 transition-colors">
              For Business
            </button>
            <button onClick={() => navigate("/privacy")} className="text-white/50 hover:text-white/80 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => navigate("/terms")} className="text-white/50 hover:text-white/80 transition-colors">
              Terms of Service
            </button>
            <button onClick={() => navigate("/help")} className="text-white/50 hover:text-white/80 transition-colors">
              Help
            </button>
          </div>

          <p className="text-xs text-white/40 font-public-sans">
            © 2026 Lansa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
