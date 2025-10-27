import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Briefcase, BarChart3, Plus } from "lucide-react";
import { MobileEmployerDashboard } from "./MobileEmployerDashboard";
import { MobileCandidateBrowser } from "./MobileCandidateBrowser";
import { MobileJobCreator } from "./MobileJobCreator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { discoveryService } from "@/services/discoveryService";
import { swipeService } from "@/services/swipeService";
import { matchService } from "@/services/matchService";
import type { DiscoveryProfile } from "@/services/discoveryService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gsap } from "gsap";

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

interface MobileEmployerTabsProps {
  businessData: BusinessData | null;
}

export function MobileEmployerTabs({ businessData }: MobileEmployerTabsProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showJobCreator, setShowJobCreator] = useState(false);
  const [showCandidateBrowser, setShowCandidateBrowser] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  
  // Data states
  const [stats, setStats] = useState<EmployerStats>({
    activeJobs: 0,
    totalApplications: 0,
    candidatesViewed: 0,
    newMatches: 0
  });
  const [candidates, setCandidates] = useState<DiscoveryProfile[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadEmployerStats();
    }
  }, [user?.id]);

  // Scroll detection for navigation animation
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollTop = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;
      
      // Check if scrolled to within 50px of bottom
      const isBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      if (isBottom !== isAtBottom) {
        setIsAtBottom(isBottom);
        
        // GSAP animation
        if (navRef.current) {
          if (isBottom) {
            // Animate to footer mode
            gsap.to(navRef.current, {
              position: 'relative',
              bottom: 0,
              opacity: 0.95,
              duration: 0.3,
              ease: "power2.out"
            });
          } else {
            // Animate back to fixed mode
            gsap.to(navRef.current, {
              position: 'fixed',
              opacity: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          }
        }
      }
    };

    const scrollContainer = document.querySelector('.employer-scroll-container');
    scrollContainer?.addEventListener('scroll', handleScroll);
    
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, [isAtBottom]);

  const loadEmployerStats = async () => {
    if (!user?.id) return;

    try {
      // Get business profile
      const { data: businessProfile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (businessProfile) {
        // Count active job listings
        const { count: jobCount } = await supabase
          .from('job_listings')
          .select('*', { count: 'exact' })
          .eq('business_id', businessProfile.id)
          .eq('is_active', true);

        setStats(prev => ({ ...prev, activeJobs: jobCount || 0 }));
      }

      // Count total swipes (candidate views)
      const { count: swipeCount } = await supabase
        .from('swipes')
        .select('*', { count: 'exact' })
        .eq('swiper_user_id', user.id);

      // Get matches
      const matches = await matchService.getMatches(user.id);

      setStats(prev => ({
        ...prev,
        candidatesViewed: swipeCount || 0,
        newMatches: matches.length
      }));
    } catch (error) {
      console.error('Error loading employer stats:', error);
    }
  };

  const loadCandidates = async () => {
    if (!user?.id) return;

    try {
      setIsLoadingCandidates(true);
      const profiles = await discoveryService.getDiscoveryProfiles(user.id, 'employee');
      setCandidates(profiles);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error("Failed to load candidates");
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const handleCreateJob = () => {
    setShowJobCreator(true);
  };

  const handleBrowseCandidates = async () => {
    await loadCandidates();
    setShowCandidateBrowser(true);
  };

  const handleJobCreated = async (jobData: any) => {
    if (!user?.id) return;

    try {
      // Get or create business profile
      let { data: businessProfile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!businessProfile) {
        const { data: newProfile, error: profileError } = await supabase
          .from('business_profiles')
          .insert({
            user_id: user.id,
            company_name: businessData?.company_name || jobData.company,
            company_size: businessData?.business_size || '',
            description: businessData?.business_services || ''
          })
          .select('id')
          .single();

        if (profileError) throw profileError;
        businessProfile = newProfile;
      }

      // Create job listing
      const { error: jobError } = await supabase
        .from('job_listings')
        .insert({
          business_id: businessProfile.id,
          title: jobData.title,
          description: jobData.description,
          location: jobData.location,
          mode: 'employee',
          top_skills: jobData.skills,
          is_active: jobData.isActive
        });

      if (jobError) throw jobError;

      toast.success("Job posted successfully!");
      setShowJobCreator(false);
      loadEmployerStats(); // Refresh stats
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error("Failed to post job");
    }
  };

  const handleCandidateSwipe = async (profile: DiscoveryProfile, direction: 'left' | 'right' | 'nudge') => {
    if (!user?.id) return;

    try {
      await swipeService.recordSwipe({
        swiper_user_id: user.id,
        target_user_id: profile.user_id,
        direction: direction === 'right' ? 'right' : direction === 'nudge' ? 'nudge' : 'left',
        context: 'employee',
      });

      if (direction === 'right' || direction === 'nudge') {
        const isMatch = await swipeService.checkForMatch(
          user.id,
          profile.user_id,
          'employee'
        );

        if (isMatch) {
          toast.success("It's a match! 🎉");
          setStats(prev => ({ ...prev, newMatches: prev.newMatches + 1 }));
        }
      }

      setStats(prev => ({ ...prev, candidatesViewed: prev.candidatesViewed + 1 }));
    } catch (error) {
      console.error('Error recording swipe:', error);
      toast.error("Failed to record action");
    }
  };

  // Show full-screen components
  if (showJobCreator) {
    return (
      <MobileJobCreator
        userId={user?.id || ""}
        onComplete={handleJobCreated}
        onClose={() => setShowJobCreator(false)}
        companyName={businessData?.company_name}
      />
    );
  }

  if (showCandidateBrowser) {
    return (
      <MobileCandidateBrowser
        userId={user?.id || ""}
        onBack={() => setShowCandidateBrowser(false)}
      />
    );
  }

  return (
    <div className="employer-theme h-full bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        {/* Tab Content */}
        <div className={`h-[calc(100vh-64px)] overflow-y-auto employer-scroll-container ${isAtBottom ? 'pb-2' : 'pb-20'}`}>
          <TabsContent value="dashboard" className="h-full m-0">
            <div className="md:hidden">
              <MobileEmployerDashboard
                userName={user?.displayName || businessData?.company_name || "Employer"}
                businessData={businessData}
                stats={stats}
                onCreateJob={handleCreateJob}
                onBrowseCandidates={handleBrowseCandidates}
              />
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="h-full m-0 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Job Management</h2>
                <Button onClick={handleCreateJob} size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  New Job
                </Button>
              </div>

              <Card>
                <CardContent className="p-6 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Active Jobs</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start by posting your first job listing
                  </p>
                  <Button onClick={handleCreateJob} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="h-full m-0 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Browse Candidates</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{stats.newMatches}</div>
                    <p className="text-xs text-muted-foreground">Matches</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{stats.candidatesViewed}</div>
                    <p className="text-xs text-muted-foreground">Reviewed</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Discover Talent</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Browse through qualified candidates and find your next hire
                  </p>
                  <Button onClick={handleBrowseCandidates} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Start Browsing
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="h-full m-0 p-4">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Analytics</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Active Jobs</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold">{stats.activeJobs}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Candidates Viewed</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold">{stats.candidatesViewed}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Matches</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold">{stats.newMatches}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Applications</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold">{stats.totalApplications}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Detailed Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced analytics features coming soon
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>

        {/* Bottom Tab Navigation */}
        <TabsList 
          ref={navRef}
          className="fixed bottom-0 left-0 right-0 h-16 bg-white shadow-lg px-4 py-2 flex justify-between items-center gap-2"
          style={{ maxWidth: '100vw' }}
        >
          <TabsTrigger 
            value="dashboard" 
            className="flex-1 flex items-center justify-center h-full rounded-lg transition-all shadow-sm data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground"
          >
            <LayoutDashboard className="h-7 w-7" />
          </TabsTrigger>
          <TabsTrigger 
            value="jobs" 
            className="flex-1 flex items-center justify-center h-full rounded-lg transition-all shadow-sm data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground"
          >
            <Briefcase className="h-7 w-7" />
          </TabsTrigger>
          <TabsTrigger 
            value="candidates" 
            className="flex-1 flex items-center justify-center h-full rounded-lg transition-all shadow-sm data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground"
          >
            <Users className="h-7 w-7" />
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex-1 flex items-center justify-center h-full rounded-lg transition-all shadow-sm data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground"
          >
            <BarChart3 className="h-7 w-7" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}