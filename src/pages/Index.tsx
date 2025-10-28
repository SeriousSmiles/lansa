import { useNavigate } from "react-router-dom";
import { Header83 } from "@/components/hero/Header83";
import { SEOHead } from "@/components/SEOHead";

export default function IndexPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Lansa - AI-Powered Professional Profile Builder | Transform Your Career"
        description="Join thousands building better careers with Lansa's AI-powered professional profile builder. Get personalized career insights, create compelling profiles, and connect with opportunities that match your goals."
        keywords="professional profile builder, AI career coach, career development, resume builder, job search platform, professional networking, career insights, profile optimization"
        canonical="https://lansa.online/"
      />
      <Header83
        heading="Professionals and Businesses, Connected"
        description="Build a standout professional profile, discover opportunities, and unlock your career potential with AI-powered insights."
        buttons={[
          { 
            title: "Get Started",
            variant: "primary" as const,
            className: "bg-primary hover:bg-primary/90 text-primary-foreground font-urbanist font-semibold",
            onClick: () => navigate('/signup')
          },
          { 
            title: "Sign In", 
            variant: "secondary" as const,
            className: "bg-secondary hover:bg-secondary/90 text-secondary-foreground font-urbanist font-semibold",
            onClick: () => navigate('/login')
          }
        ]}
        images={[
          {
            src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=800&fit=crop",
            alt: "Professional team collaboration",
          },
          {
            src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=800&fit=crop",
            alt: "Career development workshop",
          },
          {
            src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=800&fit=crop",
            alt: "Professional networking event",
          },
          {
            src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=800&fit=crop",
            alt: "Business professional at work",
          },
          {
            src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=800&fit=crop",
            alt: "Team meeting and collaboration",
          },
          {
            src: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=800&fit=crop",
            alt: "Professional workspace",
          },
          {
            src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=800&fit=crop",
            alt: "Career success celebration",
          },
          {
            src: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=800&fit=crop",
            alt: "Modern office environment",
          },
          {
            src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=800&fit=crop",
            alt: "Technology and innovation",
          },
        ]}
      />
    </>
  );
}
