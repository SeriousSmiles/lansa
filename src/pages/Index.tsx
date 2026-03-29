import { useNavigate } from "react-router-dom";
import { Header83 } from "@/components/hero/Header83";
import { SEOHead } from "@/components/SEOHead";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { CaribbeanSection } from "@/components/landing/CaribbeanSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

import homepage1 from "@/assets/homepage-1.png";
import homepage2 from "@/assets/homepage-2.png";
import homepage3 from "@/assets/homepage-3.png";
import homepage4 from "@/assets/homepage-4.png";
import homepage5 from "@/assets/homepage-5.png";
import homepage6 from "@/assets/homepage-6.png";
import homepage7 from "@/assets/homepage-7.png";
import homepage8 from "@/assets/homepage-8.png";
import homepage9 from "@/assets/homepage-9.png";

export default function IndexPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Lansa - AI-Powered Professional Profile Builder | Transform Your Career | Find the right employee"
        description="Join thousands building better careers with Lansa's AI-powered professional profile builder. Get personalized career insights, create compelling profiles, and connect with opportunities that match your goals."
        keywords="professional profile builder, AI career coach, career development, resume builder, job search platform, professional networking, career insights, profile optimization"
        canonical="https://www.lansa.online/"
      />
      <LandingNavbar />
      <Header83
        heading="Professionals and Businesses, Connected"
        description="Lansa is a software company that gives young professionals something better to offer and connects them to business that needs them."
        buttons={[
          {
            title: "Get Started",
            variant: "primary" as const,
            className:
              "bg-primary hover:bg-primary/90 text-white font-urbanist font-semibold shadow-[0px_32px_24px_0px_rgba(255,255,255,0.05)_inset,0px_2px_1px_0px_rgba(255,255,255,0.25)_inset,0px_-2px_1px_0px_rgba(0,0,0,0.20)_inset] rounded border-0",
            onClick: () => navigate("/signup"),
          },
          {
            title: "Sign In",
            variant: "secondary-alt" as const,
            className:
              "bg-secondary hover:bg-secondary/90 text-white font-urbanist font-semibold shadow-[0px_-2px_1px_0px_rgba(13,5,4,0.05)_inset] rounded border-0",
            onClick: () => navigate("/login"),
          },
        ]}
        images={[
          { src: homepage2, alt: "Lansa team and platform" },
          { src: homepage3, alt: "Professional development with Lansa" },
          { src: homepage4, alt: "Career growth opportunities" },
          { src: homepage5, alt: "Business connections" },
          { src: homepage1, alt: "Lansa community collaboration" },
          { src: homepage6, alt: "Professional networking" },
          { src: homepage7, alt: "Team success with Lansa" },
          { src: homepage8, alt: "Career transformation" },
          { src: homepage9, alt: "Professional opportunities" },
        ]}
      />
      <CaribbeanSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <LandingFooter />
    </>
  );
}
