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
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/60" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] text-center">
        <h2 className="text-3xl font-bold font-urbanist text-white md:text-5xl leading-tight max-w-2xl mx-auto">
          Your Career Starts Here
        </h2>
        <p className="mt-5 text-white/80 font-public-sans text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Join Lansa today and take control of your professional future. Build
          your profile, earn certifications, and connect with businesses across
          the Caribbean.
        </p>
        <div className="mt-8">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate("/signup")}
            className="font-urbanist font-semibold text-base px-10"
          >
            Sign Up Free
          </Button>
        </div>
      </div>
    </section>
  );
};
