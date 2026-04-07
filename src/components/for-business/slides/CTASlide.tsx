import { useNavigate } from "react-router-dom";
import AnimatedLogo from "@/components/AnimatedLogo";
import { ArrowRight, MessageCircle, Mail, Phone } from "lucide-react";

export function CTASlide() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full relative overflow-hidden min-h-0">
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

        <button
          onClick={() => navigate("/signup")}
          className="flex items-center gap-2 lg:gap-3 px-7 py-4 lg:px-10 lg:py-5 bg-[hsl(var(--lansa-orange))] text-white rounded-xl text-[15px] lg:text-[17px] font-bold font-['Urbanist'] hover:opacity-90 transition-opacity shadow-lg shadow-[hsl(14,90%,60%)]/20 mb-6 lg:mb-8"
        >
          Create Your Account
          <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5" />
        </button>

        <p className="text-[12px] lg:text-[13px] text-white/30 font-['Urbanist'] mb-3">Or reach out directly</p>
        <div className="flex items-center gap-4">
          <a
            href="https://wa.me/59995279966"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 lg:bg-white/10 lg:border-white/15 lg:text-white/70 lg:hover:bg-emerald-500/20 lg:hover:text-emerald-400 lg:hover:border-emerald-400/30 backdrop-blur flex items-center justify-center transition-all"
            title="WhatsApp"
          >
            <MessageCircle className="h-5 w-5 lg:h-6 lg:w-6" />
          </a>
          <a
            href="mailto:john@lansa.online"
            className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[hsl(var(--lansa-orange))]/20 border border-[hsl(var(--lansa-orange))]/30 text-[hsl(var(--lansa-orange))] lg:bg-white/10 lg:border-white/15 lg:text-white/70 lg:hover:bg-[hsl(var(--lansa-orange))]/20 lg:hover:text-[hsl(var(--lansa-orange))] lg:hover:border-[hsl(var(--lansa-orange))]/30 backdrop-blur flex items-center justify-center transition-all"
            title="Email"
          >
            <Mail className="h-5 w-5 lg:h-6 lg:w-6" />
          </a>
          <a
            href="tel:+59995279966"
            className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[hsl(var(--lansa-blue))]/20 border border-[hsl(var(--lansa-blue))]/30 text-[hsl(var(--lansa-blue))] lg:bg-white/10 lg:border-white/15 lg:text-white/70 lg:hover:bg-[hsl(var(--lansa-blue))]/20 lg:hover:text-[hsl(var(--lansa-blue))] lg:hover:border-[hsl(var(--lansa-blue))]/30 backdrop-blur flex items-center justify-center transition-all"
            title="Call"
          >
            <Phone className="h-5 w-5 lg:h-6 lg:w-6" />
          </a>
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
