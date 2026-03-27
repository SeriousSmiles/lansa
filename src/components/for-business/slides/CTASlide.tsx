import { useNavigate } from "react-router-dom";
import AnimatedLogo from "@/components/AnimatedLogo";
import { ArrowRight, Mail } from "lucide-react";

export function CTASlide() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full bg-gradient-to-br from-[hsl(215,85%,12%)] via-[hsl(215,85%,20%)] to-[hsl(215,70%,10%)] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[hsl(14,90%,60%)] opacity-[0.04] -bottom-[200px] -right-[100px]" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[hsl(215,85%,55%)] opacity-[0.05] -top-[100px] -left-[100px]" />

      <AnimatedLogo size={100} className="mb-10" />

      <h2 className="text-[64px] font-bold text-white font-['Urbanist'] mb-4 leading-tight text-center">
        Ready to Hire Smarter?
      </h2>
      <p className="text-xl text-white/60 mb-12 text-center max-w-[600px]">
        Create your organization account today and start browsing Lansa Certified talent in minutes.
      </p>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => navigate("/signup")}
          className="flex items-center gap-3 px-10 py-5 bg-[hsl(var(--lansa-orange))] text-white rounded-xl text-lg font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[hsl(14,90%,60%)]/20"
        >
          Create Your Account
          <ArrowRight className="h-5 w-5" />
        </button>
        <button
          onClick={() => window.location.href = "mailto:hello@lansa.app"}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white/80 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
        >
          <Mail className="h-4 w-4" />
          Questions? Contact us
        </button>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <p className="text-white/20 text-xs">
          © {new Date().getFullYear()} Lansa · Built for the Caribbean
        </p>
      </div>
    </div>
  );
}
