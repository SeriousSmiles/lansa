import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, TrendingUp, Globe, Star, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <>
      <SEOHead
        title="Lansa - AI-Powered Career Development Platform | Dutch Caribbean Professional Growth"
        description="Transform your career in the Dutch Caribbean with Lansa's AI-powered professional profile builder. Create compelling profiles, get personalized career insights, and connect with opportunities in Curaçao, Aruba, and Sint Maarten."
        keywords="career development dutch caribbean, professional profile builder curacao, job search aruba, career coaching sint maarten, AI career development caribbean, professional networking antilles, resume builder caribbean, career growth dutch islands"
        canonical="https://lansa.online/"
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
                alt="Lansa Career Development Platform"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-primary">Lansa</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link>
              <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">Help</Link>
            </nav>
            <div className="flex space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/auth">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Transform Your Career in the
              <span className="text-primary block">Dutch Caribbean</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI-powered career development platform designed for professionals in Curaçao, Aruba, Sint Maarten, and the broader Caribbean region. Build compelling profiles, get personalized insights, and unlock new opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/auth">Start Your Career Journey <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Why Caribbean Professionals Choose Lansa
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Unlike software development platforms, Lansa focuses exclusively on career development and professional growth in the Caribbean job market.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">AI-Powered Profile Building</h3>
                  <p className="text-muted-foreground">
                    Create professional profiles tailored to the Dutch Caribbean job market with our intelligent AI assistant.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Career Insights & Analytics</h3>
                  <p className="text-muted-foreground">
                    Get personalized career guidance and market insights specific to opportunities in Curaçao, Aruba, and Sint Maarten.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Regional Network</h3>
                  <p className="text-muted-foreground">
                    Connect with employers and opportunities across the Dutch Caribbean islands and broader Caribbean region.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-card/50">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Built for Caribbean Career Success
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Regional Job Market Focus</h3>
                      <p className="text-muted-foreground">Tailored specifically for the Dutch Caribbean professional landscape and culture.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Multilingual Support</h3>
                      <p className="text-muted-foreground">Interface available in English and Dutch to serve the diverse Caribbean community.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Local Employer Connections</h3>
                      <p className="text-muted-foreground">Direct connections to opportunities with employers in Curaçao, Aruba, and Sint Maarten.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Career Development Focus</h3>
                      <p className="text-muted-foreground">Unlike technical software platforms, we focus exclusively on professional career growth.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 text-center">
                  <Star className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Join 1000+ Caribbean Professionals</h3>
                  <p className="text-muted-foreground">
                    Already building successful careers across the Dutch Caribbean islands.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Accelerate Your Caribbean Career?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join professionals across Curaçao, Aruba, Sint Maarten, and the wider Caribbean who are already transforming their careers with Lansa.
            </p>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 bg-background text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/auth">Get Started for Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t bg-card/50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
                    alt="Lansa"
                    className="h-6 w-auto"
                  />
                  <span className="font-bold text-primary">Lansa</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  AI-powered career development platform for Dutch Caribbean professionals.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Platform</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
                  <li><Link to="/help" className="hover:text-primary transition-colors">Help</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Regions</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Curaçao</li>
                  <li>Aruba</li>
                  <li>Sint Maarten</li>
                  <li>Caribbean Region</li>
                </ul>
              </div>
            </div>
            <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; 2025 Lansa. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}