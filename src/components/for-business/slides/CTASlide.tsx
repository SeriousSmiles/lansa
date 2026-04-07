import { useNavigate } from "react-router-dom";
import AnimatedLogo from "@/components/AnimatedLogo";
import { ArrowRight, Mail } from "lucide-react";

export function CTASlide() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400&q=80)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/50" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 md:px-10">
        <AnimatedLogo size={60} className="mb-6 lg:mb-10 lg:[&]:w-[80px] lg:[&]:h-[80px]" />

        <h2 className="font-['Urbanist'] mb-3 lg:mb-4 text-center">
          <span className="text-[36px] md:text-[48px] lg:text-[64px] font-extralight text-white leading-[1.1] block">Ready to Hire</span>
          <span className="text-[44px] md:text-[56px] lg:text-[72px] font-black text-white leading-[1.0] block">Smarter?</span>
        </h2>
        <div className="w-12 lg:w-16 h-[2px] bg-[hsl(var(--lansa-orange))] mx-auto mb-4 lg:mb-6" />
        <p className="text-[14px] lg:text-[18px] text-white/50 mb-8 lg:mb-12 text-center max-w-[520px] font-['Urbanist'] font-light leading-relaxed">
          Create your organization account today and start browsing Lansa Certified talent in minutes.
        </p>

        <div className="flex flex-col items-center gap-3 lg:gap-4">
          <button
            onClick={() => navigate("/signup")}
            className="flex items-center gap-2 lg:gap-3 px-7 py-4 lg:px-10 lg:py-5 bg-[hsl(var(--lansa-orange))] text-white rounded-xl text-[15px] lg:text-[17px] font-bold font-['Urbanist'] hover:opacity-90 transition-opacity shadow-lg shadow-[hsl(14,90%,60%)]/20"
          >
            Create Your Account
            <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
          <button
            onClick={() => window.location.href = "mailto:hello@lansa.app"}
            className="flex items-center gap-2 px-5 py-2.5 lg:px-6 lg:py-3 bg-white/10 backdrop-blur text-white/70 rounded-lg text-[13px] lg:text-[14px] font-medium font-['Urbanist'] hover:bg-white/20 transition-colors"
          >
            <Mail className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            Questions? Contact us
          </button>
        </div>

        <div className="absolute bottom-6 lg:bottom-10 flex flex-col items-center gap-2">
          <p className="text-white/15 text-[11px] lg:text-[12px] font-['Urbanist']">
            © {new Date().getFullYear()} Lansa · Built for the Caribbean
          </p>
        </div>
      </div>
    </div>
  );
}
