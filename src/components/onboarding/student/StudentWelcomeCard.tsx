import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import lansaWelcomeHero from "@/assets/onboarding/lansa-welcome-hero.jpg";

interface StudentWelcomeCardProps {
  onStart: () => void;
}

export function StudentWelcomeCard({ onStart }: StudentWelcomeCardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl">
        <img 
          src={lansaWelcomeHero} 
          alt="Welcome to Lansa - Transform your future"
          className="w-full h-64 lg:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center justify-center">
          <div className="text-center text-white px-6 space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-inter animate-fade-in">
              Welcome to Lansa
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90 animate-fade-in [animation-delay:200ms]">
              Transform how employers see your potential
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="bg-card border-border shadow-lg">
        <div className="p-6 lg:p-8 text-center space-y-8">
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              You're about to show the world how you deliver value — before you even get hired. Let's transform how employers see you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
            <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary text-lg">💡</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm lg:text-base">Transform Skills</h3>
              <p className="text-xs lg:text-sm text-muted-foreground">Turn what you know into value statements</p>
            </div>
            
            <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border border-accent/20 hover:border-accent/30 transition-colors">
              <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-accent text-lg">🎯</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm lg:text-base">90-Day Promise</h3>
              <p className="text-xs lg:text-sm text-muted-foreground">Show your initiative and forward thinking</p>
            </div>
            
            <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl border border-secondary/20 hover:border-secondary/30 transition-colors">
              <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-secondary text-lg">🪞</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm lg:text-base">Power Mirror</h3>
              <p className="text-xs lg:text-sm text-muted-foreground">See how hiring managers see you</p>
            </div>
          </div>

          <div className="space-y-6">
            <Button 
              onClick={onStart}
              size="lg"
              className="px-8 lg:px-12 py-3 lg:py-4 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Let's Transform Your Future
            </Button>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>⏱️</span>
                <span>5 minutes</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🔒</span>
                <span>Private & secure</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✨</span>
                <span>AI-powered</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}