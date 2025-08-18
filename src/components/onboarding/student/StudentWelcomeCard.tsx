import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import welcomeHero from "@/assets/onboarding/welcome-hero.jpg";

interface StudentWelcomeCardProps {
  onStart: () => void;
}

export function StudentWelcomeCard({ onStart }: StudentWelcomeCardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl mb-8">
        <img 
          src={welcomeHero} 
          alt="Welcome to your future"
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center justify-center">
          <div className="text-center text-white px-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              Welcome to Your Future
            </h1>
            <p className="text-xl md:text-2xl opacity-90 animate-fade-in [animation-delay:200ms]">
              This isn't a test. It's your transformation.
            </p>
          </div>
        </div>
      </div>

      <Card className="p-8 bg-card border-border shadow-lg">
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <div className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              You're about to show the world how you deliver value — before you even get hired. Let's transform how employers see you.
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 my-8">
            <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-xl">💡</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Transform Skills</h3>
              <p className="text-sm text-muted-foreground">Turn what you know into value statements employers notice</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border border-accent/20">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-accent text-xl">🎯</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">90-Day Promise</h3>
              <p className="text-sm text-muted-foreground">Create a powerful commitment that shows your initiative</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl border border-secondary/20">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-secondary text-xl">🪞</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Power Mirror</h3>
              <p className="text-sm text-muted-foreground">See how hiring managers interpret your potential</p>
            </div>
          </div>

          <div className="pt-6">
            <Button 
              onClick={onStart}
              size="lg"
              className="px-12 py-4 text-base md:text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Let's Transform Your Future
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-6 text-xs text-muted-foreground pt-4">
            <div className="flex items-center space-x-1">
              <span>⏱️</span>
              <span>5 minutes</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🔒</span>
              <span>Private & secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>✨</span>
              <span>AI-powered insights</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}