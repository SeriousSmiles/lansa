import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import homepage1 from "@/assets/homepage-1.png";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background image + overlay */}
      <div className="absolute inset-0 z-0">
        <img src={homepage1} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/60 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] text-center">
        <h2 className="text-3xl font-bold font-urbanist text-white md:text-5xl leading-tight max-w-2xl mx-auto">
          Build Your Resume. Learn From Local Mentors. Get Discovered.
        </h2>
        <p className="mt-5 text-white/80 font-public-sans text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Create a professional resume, print it, and learn from local teachers and mentors — all for free. Ready to stand out? Get Lansa Certified and start appearing in front of businesses looking for your talent.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate("/signup")}
            className="font-urbanist font-semibold text-base px-10"
          >
            Sign Up Free
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => navigate("/pricing")}
            className="font-urbanist font-semibold text-base text-white hover:text-white hover:bg-white/10"
          >
            View Pricing →
          </Button>
        </div>
      </div>
    </section>
  );
};
