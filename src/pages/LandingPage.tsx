import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  ArrowRight, 
  Sparkles, 
  Target, 
  Users, 
  TrendingUp,
  CheckCircle,
  Star,
  Award,
  Zap
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      const tl = gsap.timeline();
      
      tl.from(".hero-badge", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out"
      })
      .from(".hero-title", {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power2.out"
      }, "-=0.3")
      .from(".hero-subtitle", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.5")
      .from(".hero-buttons", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.3")
      .from(".hero-image", {
        opacity: 0,
        scale: 0.8,
        duration: 1.2,
        ease: "power2.out"
      }, "-=0.8");

      // Features section scroll animation
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        },
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
      });

      // Benefits section
      gsap.from(".benefit-item", {
        scrollTrigger: {
          trigger: benefitsRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        },
        opacity: 0,
        x: -50,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      });

      // Stats counter animation
      gsap.from(".stat-number", {
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        },
        opacity: 0,
        scale: 0.5,
        duration: 1,
        stagger: 0.2,
        ease: "back.out(1.7)"
      });

      // CTA section
      gsap.from(".cta-content", {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power2.out"
      });

      // Floating animation for hero image
      gsap.to(".hero-image", {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });

      // Magnetic effect for CTA buttons
      const buttons = document.querySelectorAll(".magnetic-btn");
      buttons.forEach(button => {
        button.addEventListener("mouseenter", () => {
          gsap.to(button, {
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out"
          });
        });
        
        button.addEventListener("mouseleave", () => {
          gsap.to(button, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          });
        });
      });

    }, [heroRef, featuresRef, benefitsRef, statsRef, ctaRef]);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "AI-Powered Profile Builder",
      description: "Transform your career story with intelligent suggestions and personalized recommendations.",
      image: "/public/lovable-uploads/91347dc5-2857-4d8f-9a0e-f7f93f5a739b.png"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Smart Opportunity Matching",
      description: "Get matched with opportunities that align with your skills, goals, and aspirations.",
      image: "/public/lovable-uploads/1c3395f0-854c-4830-b97a-46a12aec1d25.png"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Growth Analytics",
      description: "Track your progress and get insights to accelerate your career development.",
      image: "/public/lovable-uploads/2bc2aac1-3d99-47c5-a884-0800b05c0f76.png"
    }
  ];

  const benefits = [
    "Build a compelling professional profile in minutes",
    "Get personalized career recommendations",
    "Connect with relevant opportunities",
    "Track your professional growth",
    "Access AI-powered insights",
    "Stand out to employers and recruiters"
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "95%", label: "Success Rate" },
    { number: "500+", label: "Partner Companies" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBanner />
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
              alt="Lansa Logo"
              className="h-8 w-auto"
            />
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="magnetic-btn">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="hero-badge mb-6 text-primary bg-primary/10 border-primary/20">
                <Zap className="h-4 w-4 mr-2" />
                AI-Powered Career Platform
              </Badge>
              
              <h1 className="hero-title text-5xl lg:text-6xl font-bold font-urbanist text-foreground mb-6 leading-tight">
                Transform Your
                <span className="text-primary block">Career Story</span>
                with AI
              </h1>
              
              <p className="hero-subtitle text-xl text-muted-foreground mb-8 max-w-2xl">
                Build compelling professional profiles, discover perfect opportunities, and accelerate your career growth with personalized AI guidance.
              </p>
              
              <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/auth">
                  <Button size="lg" className="magnetic-btn w-full sm:w-auto">
                    Start Your Journey
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    See How It Works
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="hero-image relative">
              <img
                src="/public/lovable-uploads/91347dc5-2857-4d8f-9a0e-f7f93f5a739b.png"
                alt="Lansa Platform Preview"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-urbanist mb-6">
              Powerful Features for Career Success
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to build, enhance, and showcase your professional profile with AI-powered intelligence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="text-primary mb-6 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 font-urbanist">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {feature.description}
                  </p>
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-48 object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/public/lovable-uploads/155ecc34-3f01-4d49-b1ad-10c1a50803e2.png"
                alt="Professional Growth"
                className="w-full h-auto rounded-2xl shadow-xl"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold font-urbanist mb-6">
                Why Choose Lansa?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of professionals who have transformed their careers with our AI-powered platform.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-urbanist mb-4">
              Trusted by Professionals Worldwide
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="stat-number text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-urbanist mb-6">
              Recognized Excellence
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <img
                src="/public/lovable-uploads/62496478-1e20-484c-bb96-6f47496037df.png"
                alt="Certification Badge"
                className="h-12 w-auto"
              />
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
                <span className="text-sm text-muted-foreground ml-2">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Industry Leader</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section ref={ctaRef} className="py-32 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="cta-content text-center max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold font-urbanist mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of professionals who have already accelerated their career growth with Lansa's AI-powered platform.
            </p>
            <Link to="/auth">
              <Button size="lg" className="magnetic-btn text-lg px-8 py-4">
                Start Your Free Journey Today
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Get started in 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
                alt="Lansa Logo"
                className="h-6 w-auto"
              />
              <span className="text-sm text-muted-foreground">
                © 2025 Lansa. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}