import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, ChevronDown, Sparkles, UsersRound, GraduationCap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserTypeSelectionProps {
  onSelect: (userType: 'job_seeker' | 'create_org' | 'join_org' | 'mentor') => void;
}

export function UserTypeSelection({ onSelect }: UserTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<'job_seeker' | 'create_org' | 'join_org' | 'mentor' | null>(null);
  const [expandedCard, setExpandedCard] = useState<'job_seeker' | 'create_org' | 'join_org' | 'mentor' | null>(null);
  const isMobile = useIsMobile();

  const handleSelect = (type: 'job_seeker' | 'create_org' | 'join_org' | 'mentor') => {
    setSelectedType(type);
    setTimeout(() => onSelect(type), 300);
  };

  const handleCardClick = (type: 'job_seeker' | 'create_org' | 'join_org' | 'mentor') => {
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
      <div className="lansa-container">
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
          <p className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Choose your path to get a personalized experience tailored to your goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
          {/* Job Seeker Card */}
          <Card 
            className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl border-2 overflow-hidden ${
              selectedType === 'job_seeker' 
                ? 'border-primary bg-primary/5 shadow-xl scale-105' 
                : 'border-border hover:border-primary/50'
            } ${expandedCard === 'job_seeker' ? 'md:scale-100' : ''}`}
            onClick={() => handleCardClick('job_seeker')}
          >
            <div className={`relative ${isMobile ? 'aspect-square' : 'h-48'} bg-gradient-to-br from-primary to-primary/80 overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <div className="relative">
                    <Users className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} mx-auto mb-2 drop-shadow-lg`} />
                  </div>
                  <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-1`}>Seeking Opportunities</h3>
                  <p className={`text-primary-foreground/90 ${isMobile ? 'text-sm' : 'text-base'}`}>Ready to grow your career</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-4 md:p-6">
              {isMobile ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-foreground">Perfect if you're:</h4>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedCard === 'job_seeker' ? 'rotate-180' : ''}`} />
                  </div>
                  {expandedCard !== 'job_seeker' ? (
                    <p className="text-sm text-muted-foreground mb-4">Looking for opportunities...</p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-muted-foreground text-sm">Looking for new jobs</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-muted-foreground text-sm">Building your network</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-muted-foreground text-sm">Developing skills</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-3">Perfect if you're:</h4>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-muted-foreground text-sm">Looking for new job opportunities</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-muted-foreground text-sm">Building your professional network</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-muted-foreground text-sm">Developing your skills</span>
                    </div>
                  </div>
                </div>
              )}
              
              {(expandedCard === 'job_seeker' || !isMobile) && (
                <Button 
                  className={`w-full py-3 md:py-4 text-sm font-semibold transition-all duration-300 ${
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
              )}
            </CardContent>
          </Card>

          {/* Create Organization Card */}
          <Card 
            className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl border-2 overflow-hidden ${
              selectedType === 'create_org' 
                ? 'border-secondary bg-secondary/5 shadow-xl scale-105' 
                : 'border-border hover:border-secondary/50'
            } ${expandedCard === 'create_org' ? 'md:scale-100' : ''}`}
            onClick={() => handleCardClick('create_org')}
          >
            <div className={`relative ${isMobile ? 'aspect-square' : 'h-48'} bg-gradient-to-br from-secondary to-secondary/80 overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-secondary/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <div className="relative">
                    <Building2 className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} mx-auto mb-2 drop-shadow-lg`} />
                  </div>
                  <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-1`}>Building Teams</h3>
                  <p className={`text-secondary-foreground/90 ${isMobile ? 'text-sm' : 'text-base'}`}>Create your organization</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-4 md:p-6">
              {isMobile ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-foreground">Perfect if you're:</h4>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedCard === 'create_org' ? 'rotate-180' : ''}`} />
                  </div>
                  {expandedCard !== 'create_org' ? (
                    <p className="text-sm text-muted-foreground mb-4">Hiring for your company...</p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="text-muted-foreground text-sm">Creating an organization</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="text-muted-foreground text-sm">Posting jobs</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="text-muted-foreground text-sm">Inviting team members</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-3">Perfect if you're:</h4>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                      <span className="text-muted-foreground text-sm">Creating your organization</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                      <span className="text-muted-foreground text-sm">Posting job opportunities</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                      <span className="text-muted-foreground text-sm">Inviting team members</span>
                    </div>
                  </div>
                </div>
              )}
              
              {(expandedCard === 'create_org' || !isMobile) && (
                <Button 
                  className={`w-full py-3 md:py-4 text-sm font-semibold transition-all duration-300 ${
                    selectedType === 'create_org' 
                      ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' 
                      : 'bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect('create_org');
                  }}
                >
                  {selectedType === 'create_org' ? '✓ Selected' : 'Create Organization'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Join Organization Card */}
          <Card 
            className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl border-2 overflow-hidden ${
              selectedType === 'join_org' 
                ? 'border-accent bg-accent/5 shadow-xl scale-105' 
                : 'border-border hover:border-accent/50'
            } ${expandedCard === 'join_org' ? 'md:scale-100' : ''}`}
            onClick={() => handleCardClick('join_org')}
          >
            <div className={`relative ${isMobile ? 'aspect-square' : 'h-48'} bg-gradient-to-br from-accent to-accent/80 overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <div className="relative">
                    <UsersRound className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} mx-auto mb-2 drop-shadow-lg`} />
                  </div>
                  <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-1`}>Join Existing Team</h3>
                  <p className={`text-accent-foreground/90 ${isMobile ? 'text-sm' : 'text-base'}`}>Connect with your company</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-4 md:p-6">
              {isMobile ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-foreground">Perfect if you're:</h4>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedCard === 'join_org' ? 'rotate-180' : ''}`} />
                  </div>
                  {expandedCard !== 'join_org' ? (
                    <p className="text-sm text-muted-foreground mb-4">Joining your team...</p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <span className="text-muted-foreground text-sm">Joining your company</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <span className="text-muted-foreground text-sm">Collaborating on hiring</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <span className="text-muted-foreground text-sm">Working as a team</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-3">Perfect if you're:</h4>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span className="text-muted-foreground text-sm">Joining your company's team</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span className="text-muted-foreground text-sm">Collaborating on hiring</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span className="text-muted-foreground text-sm">Working as a team member</span>
                    </div>
                  </div>
                </div>
              )}
              
              {(expandedCard === 'join_org' || !isMobile) && (
                <Button 
                  className={`w-full py-3 md:py-4 text-sm font-semibold transition-all duration-300 ${
                    selectedType === 'join_org' 
                      ? 'bg-accent hover:bg-accent/90 text-accent-foreground' 
                      : 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect('join_org');
                  }}
                >
                  {selectedType === 'join_org' ? '✓ Selected' : 'Join Team'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Mentor Card */}
          <Card 
            className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl border-2 overflow-hidden ${
              selectedType === 'mentor' 
                ? 'border-primary bg-primary/5 shadow-xl scale-105' 
                : 'border-border hover:border-primary/50'
            } ${expandedCard === 'mentor' ? 'md:scale-100' : ''}`}
            onClick={() => handleCardClick('mentor')}
          >
            <div className={`relative ${isMobile ? 'aspect-square' : 'h-48'} bg-gradient-to-br from-emerald-600 to-emerald-500 overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-emerald-500/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <div className="relative">
                    <GraduationCap className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} mx-auto mb-2 drop-shadow-lg`} />
                  </div>
                  <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-1`}>Mentor</h3>
                  <p className={`text-white/90 ${isMobile ? 'text-sm' : 'text-base'}`}>Teach & share knowledge</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-4 md:p-6">
              {isMobile ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-foreground">Perfect if you're:</h4>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedCard === 'mentor' ? 'rotate-180' : ''}`} />
                  </div>
                  {expandedCard !== 'mentor' ? (
                    <p className="text-sm text-muted-foreground mb-4">Teaching & coaching...</p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span className="text-muted-foreground text-sm">Sharing video courses</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span className="text-muted-foreground text-sm">Coaching professionals</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span className="text-muted-foreground text-sm">Growing your reach</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-3">Perfect if you're:</h4>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span className="text-muted-foreground text-sm">Sharing video courses</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span className="text-muted-foreground text-sm">Coaching professionals</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span className="text-muted-foreground text-sm">Growing your audience</span>
                    </div>
                  </div>
                </div>
              )}
              
              {(expandedCard === 'mentor' || !isMobile) && (
                <Button 
                  className={`w-full py-3 md:py-4 text-sm font-semibold transition-all duration-300 ${
                    selectedType === 'mentor' 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 border border-emerald-600'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect('mentor');
                  }}
                >
                  {selectedType === 'mentor' ? '✓ Selected' : 'Start Teaching'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground text-base">
            Don't worry - you can always switch your path later
          </p>
        </div>
      </div>
    </div>
  );
}
