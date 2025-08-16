import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface StudentWelcomeCardProps {
  onStart: () => void;
}

export function StudentWelcomeCard({ onStart }: StudentWelcomeCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto p-8 bg-card border-border">
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Your Future
          </h1>
          
          <div className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
            This isn't a test. It's your first step toward showing the world how you deliver value — before you even get hired.
          </div>
        </div>

        <div className="bg-muted/30 p-6 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">What we'll do together:</p>
          <ul className="text-sm space-y-2 text-left max-w-md mx-auto">
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Transform your skills into value statements that employers notice</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Create a powerful 90-day promise that shows your initiative</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Get insights into how hiring managers see your potential</span>
            </li>
          </ul>
        </div>

        <div className="pt-4">
          <Button 
            onClick={onStart}
            size="lg"
            className="px-8 py-3 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Let's Start
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Takes about 5 minutes • Your responses stay private
        </p>
      </div>
    </Card>
  );
}