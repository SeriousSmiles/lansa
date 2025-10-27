import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, FileText, TrendingUp, Briefcase, Search } from "lucide-react";
import { gsap } from "gsap";
import { mobileAnimations } from "@/utils/mobileAnimations";
import { MobileCardLayout } from "@/components/mobile/MobileCardLayout";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

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
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  const statCards = [
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: FileText,
      color: "bg-primary",
      description: "Open positions"
    },
    {
      title: "Candidates Viewed",
      value: stats.candidatesViewed,
      icon: Users,
      color: "bg-secondary",
      description: "Profiles reviewed"
    },
    {
      title: "New Matches",
      value: stats.newMatches,
      icon: TrendingUp,
      color: "bg-primary",
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

      {/* Stats Overview - Auto-sliding Carousel */}
      <div className="px-4 mb-6">
        <MobileCardLayout className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">This Week</h3>
          </div>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[autoplayPlugin.current]}
            className="w-full"
          >
            <CarouselContent>
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <CarouselItem key={index}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${stat.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.description}</p>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
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
            className="w-full h-20 bg-secondary hover:bg-secondary/90 text-secondary-foreground border-0 rounded-2xl shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-full">
                <Plus className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Post New Job</p>
                <p className="text-xs opacity-90">Find your next hire</p>
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
            className="w-full h-20 border-2 border-primary/30 hover:bg-primary/5 hover:border-primary rounded-2xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Search className="h-6 w-6 text-primary" />
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
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-2">
                  <Briefcase className="h-5 w-5 text-primary" />
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
              <div className="p-3 bg-secondary/10 rounded-full w-fit mx-auto mb-2">
                <Users className="h-5 w-5 text-secondary" />
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