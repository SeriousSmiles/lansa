import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, FileText, TrendingUp, Briefcase, Search } from "lucide-react";
import { gsap } from "gsap";
import { mobileAnimations } from "@/utils/mobileAnimations";
import { MobileCardLayout } from "@/components/mobile/MobileCardLayout";
import { SwipeableContainer } from "@/components/mobile/SwipeableContainer";
import { Link } from "react-router-dom";

interface BusinessData {
  company_name: string;
  business_size: string;
  role_function: string;
  business_services: string;
}

interface EmployerStats {
  activeJobs: number;
  totalApplications: number;
  candidatesViewed: number;
  newMatches: number;
}

interface MobileEmployerDashboardProps {
  userName: string;
  businessData: BusinessData | null;
  stats: EmployerStats;
  onCreateJob: () => void;
  onBrowseCandidates: () => void;
}

export function MobileEmployerDashboard({ 
  userName, 
  businessData, 
  stats, 
  onCreateJob, 
  onBrowseCandidates 
}: MobileEmployerDashboardProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);

  const statCards = [
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      description: "Open positions"
    },
    {
      title: "Candidates Viewed",
      value: stats.candidatesViewed,
      icon: Users,
      color: "from-green-500 to-green-600",
      description: "Profiles reviewed"
    },
    {
      title: "New Matches",
      value: stats.newMatches,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      description: "Mutual interests"
    }
  ];

  useEffect(() => {
    if (headerRef.current) {
      mobileAnimations.pageSlideIn(headerRef.current);
    }
    
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('[data-animate="card"]');
      mobileAnimations.staggerCards(cards, 0.15);
    }
  }, []);

  const handleStatSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentStatIndex < statCards.length - 1) {
      setCurrentStatIndex(prev => prev + 1);
    } else if (direction === 'right' && currentStatIndex > 0) {
      setCurrentStatIndex(prev => prev - 1);
    }
  };

  return (
    <div className="mobile-safe-top bg-gradient-to-br from-background to-muted/50 min-h-screen">
      {/* Header */}
      <div ref={headerRef} className="px-4 py-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {businessData?.company_name || userName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">Employer</Badge>
              <Badge variant="outline" className="text-xs">Beta</Badge>
            </div>
          </div>
          <div className="relative">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {businessData && (
          <p className="text-sm text-muted-foreground">
            {businessData.business_size} • {businessData.business_services}
          </p>
        )}
      </div>

      {/* Stats Overview - Swipeable */}
      <div className="px-4 mb-6">
        <MobileCardLayout className="p-0 overflow-hidden">
          <SwipeableContainer 
            onSwipeLeft={() => handleStatSwipe('left')}
            onSwipeRight={() => handleStatSwipe('right')}
            className="h-full"
          >
            <div className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">This Week</h3>
                <div className="flex gap-1">
                  {statCards.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentStatIndex ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                {statCards.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className={`transition-all duration-500 ${
                        index === currentStatIndex ? 'opacity-100 scale-100' : 'opacity-40 scale-95'
                      }`}
                      style={{
                        display: index === currentStatIndex ? 'flex' : 'none'
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SwipeableContainer>
        </MobileCardLayout>
      </div>

      {/* Quick Actions */}
      <div ref={cardsRef} className="px-4 space-y-4">
        <h3 className="font-semibold text-foreground mb-2">Quick Actions</h3>
        
        <MobileCardLayout 
          data-animate="card" 
          className="p-0 overflow-hidden"
          animationDelay={0.1}
        >
          <Button
            onClick={onCreateJob}
            className="w-full h-20 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border-0 rounded-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-full">
                <Plus className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Post New Job</p>
                <p className="text-xs text-white/80">Find your next hire</p>
              </div>
            </div>
          </Button>
        </MobileCardLayout>

        <MobileCardLayout 
          data-animate="card" 
          className="p-0 overflow-hidden"
          animationDelay={0.2}
        >
          <Button
            onClick={onBrowseCandidates}
            variant="outline"
            className="w-full h-20 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 rounded-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-muted rounded-full">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Browse Candidates</p>
                <p className="text-xs text-muted-foreground">Discover talent</p>
              </div>
            </div>
          </Button>
        </MobileCardLayout>

        {/* Additional Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          <MobileCardLayout 
            data-animate="card" 
            className="p-4"
            animationDelay={0.3}
          >
            <Link to="/employer-dashboard" className="block">
              <div className="text-center">
                <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm text-foreground">Manage Jobs</p>
                <p className="text-xs text-muted-foreground">Edit listings</p>
              </div>
            </Link>
          </MobileCardLayout>

          <MobileCardLayout 
            data-animate="card" 
            className="p-4"
            animationDelay={0.4}
          >
            <div className="text-center">
              <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-2">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="font-medium text-sm text-foreground">Analytics</p>
              <p className="text-xs text-muted-foreground">View insights</p>
            </div>
          </MobileCardLayout>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4 py-6">
        <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
        <MobileCardLayout className="p-4">
          <div className="text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs">Start browsing candidates to see updates here</p>
          </div>
        </MobileCardLayout>
      </div>
    </div>
  );
}