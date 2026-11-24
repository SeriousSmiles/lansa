import { HomeHero } from "@/components/landing/HomeHero";
import { SEOHead } from "@/components/SEOHead";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { ManifestoScroll, ChapterStory, CapabilitiesStory } from "@/components/landing/story/StorySections";
import { TestimonialBand } from "@/components/landing/TestimonialBand";
import { CompaniesSoonBand } from "@/components/landing/CompaniesSoonBand";
import { LeadMagnetTeaser } from "@/components/landing/LeadMagnetTeaser";
import { FinalCTABand } from "@/components/landing/FinalCTABand";
import { LandingFooter } from "@/components/landing/LandingFooter";


export default function IndexPage() {
  return (
    <>
      <SEOHead
        title="Jobs & CV Builder in Curaçao | Lansa"
        description="Find jobs in Curaçao and build a professional CV for free. Get certified, stand out to local employers, and apply to opportunities with Lansa."
        keywords="professional profile builder, AI career coach, career development, resume builder, job search platform, professional networking, career insights, profile optimization"
        canonical="https://lansa.online/"
      />
      <LandingNavbar tone="light" />
      <HomeHero />
      <TrustStrip />
      <ManifestoScroll />
      <ChapterStory />
      <CapabilitiesStory />
      <TestimonialBand />
      <CompaniesSoonBand />
      <LeadMagnetTeaser />
      <FinalCTABand />
      <LandingFooter />
    </>
  );
}
