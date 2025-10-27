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
      <div ref={headerRef} className="px-5 py-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Welcome back, {businessData?.company_name || userName}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs font-medium rounded-full px-3 py-1">Employer</Badge>
              <Badge variant="outline" className="text-xs font-medium rounded-full px-3 py-1">Beta</Badge>
            </div>
          </div>
          <div className="relative">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {businessData && (
          <p className="text-sm text-muted-foreground mt-2">
            {businessData.business_size} • {businessData.business_services}
          </p>
        )}
      </div>

      {/* Stats Overview - Auto-sliding Carousel */}
      <div className="px-5 mb-6">
        <MobileCardLayout className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-foreground text-base">This Week</h3>
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
                      <div className={`p-3.5 rounded-2xl ${stat.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{stat.description}</p>
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
      <div ref={cardsRef} className="px-5 space-y-3">
        <h3 className="font-semibold text-foreground mb-3 text-base">Quick Actions</h3>
        
        <MobileCardLayout 
          data-animate="card" 
          className="p-0 overflow-hidden"
          animationDelay={0.1}
        >
          <Button
            onClick={onCreateJob}
            className="w-full h-[88px] bg-secondary hover:bg-secondary/90 text-secondary-foreground border-0 rounded-3xl shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Plus className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-base">Post New Job</p>
                <p className="text-sm opacity-80">Find your next hire</p>
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
            className="w-full h-[88px] border border-border/50 hover:bg-accent/50 hover:border-border rounded-3xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground text-base">Browse Candidates</p>
                <p className="text-sm text-muted-foreground">Discover talent</p>
              </div>
            </div>
          </Button>
        </MobileCardLayout>

        {/* Additional Actions Grid */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <MobileCardLayout 
            data-animate="card" 
            className="p-5"
            animationDelay={0.3}
          >
            <Link to="/employer-dashboard" className="block">
              <div className="text-center">
                <div className="p-3.5 bg-primary/10 rounded-2xl w-fit mx-auto mb-3">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold text-sm text-foreground">Manage Jobs</p>
                <p className="text-xs text-muted-foreground mt-1">Edit listings</p>
              </div>
            </Link>
          </MobileCardLayout>

          <MobileCardLayout 
            data-animate="card" 
            className="p-5"
            animationDelay={0.4}
          >
            <div className="text-center">
              <div className="p-3.5 bg-secondary/10 rounded-2xl w-fit mx-auto mb-3">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <p className="font-semibold text-sm text-foreground">Analytics</p>
              <p className="text-xs text-muted-foreground mt-1">View insights</p>
            </div>
          </MobileCardLayout>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-5 py-6">
        <h3 className="font-semibold text-foreground mb-4 text-base">Recent Activity</h3>
        <MobileCardLayout className="p-6">
          <div className="text-center text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No recent activity</p>
            <p className="text-xs mt-1">Start browsing candidates to see updates here</p>
          </div>
        </MobileCardLayout>
      </div>
    </div>
  );
}