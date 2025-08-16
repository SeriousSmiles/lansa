import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Sparkles, Building2 } from "lucide-react";

interface UserTypeSelectionProps {
  onSelect: (userType: 'job_seeker' | 'employer') => void;
}

export function UserTypeSelection({ onSelect }: UserTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<'job_seeker' | 'employer' | null>(null);

  const handleSelect = (type: 'job_seeker' | 'employer') => {
    setSelectedType(type);
    setTimeout(() => onSelect(type), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center px-4">
      <div className="lansa-container">{/* Use Lansa container */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome to Lansa
            </h1>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-6">
            What brings you here today?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Choose your path to get a personalized experience tailored to your goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card 
            className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl border-2 overflow-hidden ${
              selectedType === 'job_seeker' 
                ? 'border-primary bg-primary/5 shadow-xl scale-105' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => handleSelect('job_seeker')}
          >
            <div className="relative h-64 bg-gradient-to-br from-primary to-primary/80 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <div className="relative">
                    <Users className="w-20 h-20 mx-auto mb-4 drop-shadow-lg" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/20 rounded-full animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">Seeking Opportunities</h3>
                  <p className="text-primary-foreground/90 text-lg">Ready to grow your career</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-8">
              <h4 className="text-xl font-semibold text-foreground mb-4">Perfect if you're:</h4>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Looking for new job opportunities</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Building your professional network</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Developing your skills and career</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Showcasing your achievements</span>
                </div>
              </div>
              
              <Button 
                className={`w-full py-6 text-lg font-semibold transition-all duration-300 ${
                  selectedType === 'job_seeker' 
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                    : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary'
                }`}
              >
                {selectedType === 'job_seeker' ? '✓ Selected' : 'Start Your Journey'}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl border-2 overflow-hidden ${
              selectedType === 'employer' 
                ? 'border-secondary bg-secondary/5 shadow-xl scale-105' 
                : 'border-border hover:border-secondary/50'
            }`}
            onClick={() => handleSelect('employer')}
          >
            <div className="relative h-64 bg-gradient-to-br from-secondary to-secondary/80 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-secondary/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <div className="relative">
                    <Building2 className="w-20 h-20 mx-auto mb-4 drop-shadow-lg" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/20 rounded-full animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">Building Teams</h3>
                  <p className="text-secondary-foreground/90 text-lg">Ready to find great talent</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-8">
              <h4 className="text-xl font-semibold text-foreground mb-4">Perfect if you're:</h4>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-muted-foreground">Hiring for open positions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-muted-foreground">Building a strong team</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-muted-foreground">Connecting with top talent</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-muted-foreground">Growing your business</span>
                </div>
              </div>
              
              <Button 
                className={`w-full py-6 text-lg font-semibold transition-all duration-300 ${
                  selectedType === 'employer' 
                    ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' 
                    : 'bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary'
                }`}
              >
                {selectedType === 'employer' ? '✓ Selected' : 'Find Great Talent'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground text-lg">
            Don't worry - you can always switch your path later
          </p>
        </div>
      </div>
    </div>
  );
}