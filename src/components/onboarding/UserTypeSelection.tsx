import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Sparkles, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserTypeSelectionProps {
  onSelect: (userType: 'job_seeker' | 'employer') => void;
}

export function UserTypeSelection({ onSelect }: UserTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<'job_seeker' | 'employer' | null>(null);
  const [expandedCard, setExpandedCard] = useState<'job_seeker' | 'employer' | null>(null);
  const isMobile = useIsMobile();

  const handleSelect = (type: 'job_seeker' | 'employer') => {
    setSelectedType(type);
    setTimeout(() => onSelect(type), 300);
  };

  const handleCardClick = (type: 'job_seeker' | 'employer') => {
    if (isMobile) {
      if (expandedCard === type) {
        handleSelect(type);
      } else {
        setExpandedCard(type);
      }
    } else {
      handleSelect(type);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center px-4">
      <div className="lansa-container">{/* Use Lansa container */}
        <div className="text-center mb-8 md:mb-16">
          <div className="flex flex-col md:inline-flex md:flex-row items-center gap-2 mb-4 md:mb-6">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome to Lansa
            </h1>
          </div>
          <h2 className="text-xl md:text-3xl font-bold text-foreground mb-4 md:mb-6">
            What brings you here today?
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Choose your path to get a personalized experience tailored to your goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-12">
          <Card 
            className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl border-2 overflow-hidden ${
              selectedType === 'job_seeker' 
                ? 'border-primary bg-primary/5 shadow-xl scale-105' 
                : 'border-border hover:border-primary/50'
            } ${expandedCard === 'job_seeker' ? 'md:scale-100' : ''}`}
            onClick={() => handleCardClick('job_seeker')}
          >
            <div className={`relative ${isMobile ? 'h-24' : 'h-64'} bg-gradient-to-br from-primary to-primary/80 overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-4 md:p-8">
                  <div className="relative">
                    <Users className={`${isMobile ? 'w-8 h-8' : 'w-20 h-20'} mx-auto mb-2 md:mb-4 drop-shadow-lg`} />
                    {!isMobile && <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/20 rounded-full animate-pulse" />}
                  </div>
                  <h3 className={`${isMobile ? 'text-lg' : 'text-3xl'} font-bold mb-1 md:mb-2`}>Seeking Opportunities</h3>
                  <p className={`text-primary-foreground/90 ${isMobile ? 'text-sm' : 'text-lg'}`}>Ready to grow your career</p>
                  {isMobile && (
                    <ChevronDown className={`w-4 h-4 mx-auto mt-1 transition-transform ${expandedCard === 'job_seeker' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </div>
            </div>
            
            <CardContent className={`${isMobile && expandedCard !== 'job_seeker' ? 'hidden' : 'block'} p-4 md:p-8`}>
              <h4 className="text-lg md:text-xl font-semibold text-foreground mb-4">Perfect if you're:</h4>
              <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground text-sm md:text-base">Looking for new job opportunities</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground text-sm md:text-base">Building your professional network</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground text-sm md:text-base">Developing your skills and career</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground text-sm md:text-base">Showcasing your achievements</span>
                </div>
              </div>
              
              <Button 
                className={`w-full py-4 md:py-6 text-base md:text-lg font-semibold transition-all duration-300 ${
                  selectedType === 'job_seeker' 
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                    : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect('job_seeker');
                }}
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
            } ${expandedCard === 'employer' ? 'md:scale-100' : ''}`}
            onClick={() => handleCardClick('employer')}
          >
            <div className={`relative ${isMobile ? 'h-24' : 'h-64'} bg-gradient-to-br from-secondary to-secondary/80 overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-secondary/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-4 md:p-8">
                  <div className="relative">
                    <Building2 className={`${isMobile ? 'w-8 h-8' : 'w-20 h-20'} mx-auto mb-2 md:mb-4 drop-shadow-lg`} />
                    {!isMobile && <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/20 rounded-full animate-pulse" />}
                  </div>
                  <h3 className={`${isMobile ? 'text-lg' : 'text-3xl'} font-bold mb-1 md:mb-2`}>Building Teams</h3>
                  <p className={`text-secondary-foreground/90 ${isMobile ? 'text-sm' : 'text-lg'}`}>Ready to find great talent</p>
                  {isMobile && (
                    <ChevronDown className={`w-4 h-4 mx-auto mt-1 transition-transform ${expandedCard === 'employer' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </div>
            </div>
            
            <CardContent className={`${isMobile && expandedCard !== 'employer' ? 'hidden' : 'block'} p-4 md:p-8`}>
              <h4 className="text-lg md:text-xl font-semibold text-foreground mb-4">Perfect if you're:</h4>
              <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-muted-foreground text-sm md:text-base">Hiring for open positions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-muted-foreground text-sm md:text-base">Building a strong team</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-muted-foreground text-sm md:text-base">Connecting with top talent</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-muted-foreground text-sm md:text-base">Growing your business</span>
                </div>
              </div>
              
              <Button 
                className={`w-full py-4 md:py-6 text-base md:text-lg font-semibold transition-all duration-300 ${
                  selectedType === 'employer' 
                    ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' 
                    : 'bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect('employer');
                }}
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