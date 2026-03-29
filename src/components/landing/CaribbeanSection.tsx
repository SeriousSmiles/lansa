import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import homepage3 from "@/assets/homepage-3.png";

export const CaribbeanSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-[1440px] px-[5%]">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col gap-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary font-urbanist">
              For Us, By Us
            </p>
            <h2 className="text-3xl font-bold font-urbanist text-foreground md:text-5xl leading-tight">
              Crafted for Caribbean Dreams and Aspirations
            </h2>
            <p className="text-muted-foreground font-public-sans text-base md:text-lg leading-relaxed">
              Lansa gives young professionals across the Caribbean the tools to
              compete — globally. Build an AI-powered profile in minutes, earn
              verified certifications that employers trust, generate a
              professional CV for free, and connect directly with businesses
              looking for talent like you.
            </p>
            <div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/signup")}
                className="font-urbanist font-semibold"
              >
                Get Started Free
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl">
            <img
              src={homepage3}
              alt="Young Caribbean professionals collaborating"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
