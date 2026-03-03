import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Users, FileText, TrendingUp, Briefcase, Search, Menu, LogOut, User, Building2, Heart, MessageCircle, UserCheck, Bell } from "lucide-react";
import { gsap } from "gsap";
import { mobileAnimations } from "@/utils/mobileAnimations";
import { MobileCardLayout } from "@/components/mobile/MobileCardLayout";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface BusinessData {
  company_name: string;
  business_size: string;
  role_function: string;
  business_services: string;
  company_logo?: string;
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
  onManageJobs?: () => void;
  onViewAnalytics?: () => void;
}

interface ActivityItem {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  action_url?: string | null;
}

const NOTIFICATION_ICONS: Record<string, React.ElementType> = {
  employer_interest_received: Heart,
  match_created: UserCheck,
  chat_request_accepted: MessageCircle,
  default: Bell,
};

export function MobileEmployerDashboard({ 
  userName, 
  businessData, 
  stats, 
  onCreateJob, 
  onBrowseCandidates,
  onManageJobs,
  onViewAnalytics,
}: MobileEmployerDashboardProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast({
        title: "Logged out successfully",
        description: "Come back soon!",
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Load recent activity from notifications table
  useEffect(() => {
    async function loadActivity() {
      if (!user?.id) return;
      setIsLoadingActivity(true);
      try {
        const { data } = await supabase
          .from('notifications')
          .select('id, title, message, type, created_at, action_url')
          .eq('user_id', user.id)
          .in('type', ['employer_interest_received', 'match_created', 'chat_request_accepted', 'job_application_received'])
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentActivity(data || []);
      } catch (err) {
        console.error('Error loading activity:', err);
      } finally {
        setIsLoadingActivity(false);
      }
    }
    loadActivity();
  }, [user?.id]);

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
      {/* Header with Organization Branding */}
      <div ref={headerRef} className="px-5 py-6 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              {businessData?.company_logo ? (
                <AvatarImage src={businessData.company_logo} alt={businessData.company_name} />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                {(businessData?.company_name || userName || 'E').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">
                {businessData?.company_name || userName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-primary/10 text-primary border-0">
                  Employer
                </Badge>
                <Badge variant="outline" className="text-[10px] font-medium rounded-full px-2 py-0.5">
                  Beta
                </Badge>
              </div>
            </div>
          </div>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-10 w-10 border-2 border-border/50"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background z-50">
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {businessData?.company_logo ? (
                      <AvatarImage src={businessData.company_logo} alt={businessData.company_name} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {(businessData?.company_name || 'E').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <SheetTitle className="text-base">{businessData?.company_name || 'Organization'}</SheetTitle>
                    <p className="text-xs text-muted-foreground">{businessData?.role_function || 'Member'}</p>
                  </div>
                </div>
              </SheetHeader>
              <div className="mt-4 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  <User className="mr-3 h-5 w-5" />
                  My Profile
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/organization/settings");
                  }}
                >
                  <Building2 className="mr-3 h-5 w-5" />
                  Organization Settings
                </Button>
                <div className="border-t my-3" />
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {businessData && (businessData.business_size || businessData.business_services) && (
          <p className="text-sm text-muted-foreground mt-3 ml-15">
            {[businessData.business_size, businessData.business_services].filter(Boolean).join(' • ')}
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
            opts={{ align: "start", loop: true }}
            plugins={[autoplayPlugin.current]}
            className="w-full"
          >
            <CarouselContent>
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <CarouselItem key={index}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3.5 rounded-lg ${stat.color}`}>
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
            className="w-full h-[88px] bg-secondary hover:bg-secondary/90 text-secondary-foreground border-0 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
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
            className="w-full h-[88px] border border-border/50 hover:bg-accent/50 hover:border-border rounded-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
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
            className="p-5 cursor-pointer"
            animationDelay={0.3}
          >
            <button className="block w-full" onClick={onManageJobs}>
              <div className="text-center">
                <div className="p-3.5 bg-primary/10 rounded-lg w-fit mx-auto mb-3">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold text-sm text-foreground">Manage Jobs</p>
                <p className="text-xs text-muted-foreground mt-1">Edit listings</p>
              </div>
            </button>
          </MobileCardLayout>

          <MobileCardLayout 
            data-animate="card" 
            className="p-5 cursor-pointer"
            animationDelay={0.4}
          >
            <button className="block w-full" onClick={onViewAnalytics}>
              <div className="text-center">
                <div className="p-3.5 bg-secondary/10 rounded-lg w-fit mx-auto mb-3">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <p className="font-semibold text-sm text-foreground">Analytics</p>
                <p className="text-xs text-muted-foreground mt-1">View insights</p>
              </div>
            </button>
          </MobileCardLayout>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-5 py-6">
        <h3 className="font-semibold text-foreground mb-4 text-base">Recent Activity</h3>
        <MobileCardLayout className="overflow-hidden">
          {isLoadingActivity ? (
            <div className="p-6 text-center">
              <div className="animate-pulse space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-muted rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-2.5 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No recent activity</p>
              <p className="text-xs mt-1">Start browsing candidates to see updates here</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentActivity.map((item) => {
                const IconComponent = NOTIFICATION_ICONS[item.type] || NOTIFICATION_ICONS.default;
                const isUnread = !item.action_url; // simple heuristic
                return (
                  <button
                    key={item.id}
                    className="w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
                    onClick={() => item.action_url && navigate(item.action_url)}
                  >
                    <div className="p-2 bg-primary/10 rounded-full shrink-0 mt-0.5">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.message}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </MobileCardLayout>
      </div>
    </div>
  );
}
