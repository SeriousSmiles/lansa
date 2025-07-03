import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Eye, EyeOff } from "lucide-react";
import { getUserAnswers } from "@/services/question";
import { toast } from "sonner";

export default function ProfileStarter() {
  const [isLoading, setIsLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get answers from navigation state or fetch from database
  useEffect(() => {
    async function loadData() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Try to get from navigation state first
        const stateAnswers = location.state;
        if (stateAnswers?.identity && stateAnswers?.desired_outcome) {
          setUserAnswers(stateAnswers);
        } else {
          // Fallback to fetching from database
          const answers = await getUserAnswers(user.id);
          if (answers) {
            setUserAnswers(answers);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load your data. Please try again later.");
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [user, location.state]);

  // Generate AI-like headline based on answers
  const generateHeadline = (identity: string, outcome: string) => {
    const identityMap: Record<string, string> = {
      "Freelancer": "Independent Professional",
      "Job-seeker": "Future-Ready Professional", 
      "Creative Professional": "Creative Innovator",
      "Entrepreneur": "Visionary Entrepreneur",
      "Visionary": "Strategic Visionary"
    };

    const outcomeMap: Record<string, string> = {
      "Land the job I really want": "Ready for Next-Level Opportunities",
      "Get recognition for my creative work": "Building Creative Authority",
      "Gain clarity on my professional direction": "Discovering Professional Purpose",
      "Attract better clients and opportunities": "Client-Attracting Expert",
      "Build confidence in how I present myself": "Authentically Confident Leader"
    };

    return `${identityMap[identity] || identity} | ${outcomeMap[outcome] || "Professional Growth Focused"}`;
  };

  // Generate summary based on answers
  const generateSummary = (identity: string, outcome: string) => {
    const summaries: Record<string, Record<string, string>> = {
      "Freelancer": {
        "Land the job I really want": "An independent professional positioning themselves for premium opportunities with companies that value expertise and results.",
        "Get recognition for my creative work": "A freelance creative building authority and recognition in their field through compelling work and strategic positioning.",
        "Gain clarity on my professional direction": "A freelancer clarifying their niche and value proposition to attract ideal clients and projects.",
        "Attract better clients and opportunities": "An experienced freelancer positioning themselves to work with high-value clients who appreciate quality expertise.",
        "Build confidence in how I present myself": "A freelancer developing authentic confidence to communicate their value and expertise effectively."
      },
      "Job-seeker": {
        "Land the job I really want": "A motivated professional strategically positioning themselves to stand out in competitive job markets and secure meaningful opportunities.",
        "Get recognition for my creative work": "A creative professional building a compelling portfolio and presence to catch the attention of innovative employers.",
        "Gain clarity on my professional direction": "A professional exploring their strengths and interests to identify the career path that aligns with their goals.",
        "Attract better clients and opportunities": "A professional developing expertise and positioning to attract opportunities that match their skills and ambitions.",
        "Build confidence in how I present myself": "A professional building authentic confidence to showcase their potential and value to employers."
      },
      "Creative Professional": {
        "Land the job I really want": "A creative professional positioning their artistic vision and skills for opportunities with companies that value innovation.",
        "Get recognition for my creative work": "A creative building authority and influence in their field through distinctive work and strategic professional presence.",
        "Gain clarity on my professional direction": "A creative professional defining their unique artistic voice and identifying opportunities that align with their vision.",
        "Attract better clients and opportunities": "A creative expert positioning themselves to work with clients who appreciate and invest in quality creative work.",
        "Build confidence in how I present myself": "A creative professional developing confidence to authentically share their vision and creative expertise."
      },
      "Entrepreneur": {
        "Land the job I really want": "An entrepreneurial professional seeking leadership opportunities that utilize their business mindset and innovative thinking.",
        "Get recognition for my creative work": "An entrepreneurial creative building recognition for innovative solutions and business-minded creative approaches.",
        "Gain clarity on my professional direction": "An entrepreneur clarifying their vision and identifying the most promising opportunities for building something meaningful.",
        "Attract better clients and opportunities": "An entrepreneur positioning themselves to attract high-value partnerships and opportunities that align with their vision.",
        "Build confidence in how I present myself": "An entrepreneur developing authentic confidence to communicate their vision and value proposition effectively."
      },
      "Visionary": {
        "Land the job I really want": "A strategic visionary seeking opportunities where they can drive innovation and create meaningful impact through forward-thinking leadership.",
        "Get recognition for my creative work": "A visionary creative gaining recognition for innovative approaches and thought leadership in their field.",
        "Gain clarity on my professional direction": "A visionary clarifying their unique perspective and identifying opportunities to make their biggest impact.",
        "Attract better clients and opportunities": "A visionary expert positioning themselves to work with organizations and clients ready for transformative thinking.",
        "Build confidence in how I present myself": "A visionary developing confidence to authentically share their unique perspective and strategic insights."
      }
    };

    return summaries[identity]?.[outcome] || "A professional focused on growth and clarity, ready to showcase their unique value in the marketplace.";
  };

  const handleCreateProfile = () => {
    // Navigate to profile editor with pre-filled data
    navigate('/profile', { 
      state: { 
        fromStarter: true,
        starterData: {
          identity: userAnswers.identity,
          desiredOutcome: userAnswers.desired_outcome,
          headline: generateHeadline(userAnswers.identity, userAnswers.desired_outcome),
          summary: generateSummary(userAnswers.identity, userAnswers.desired_outcome)
        }
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E] animate-pulse">Creating your profile starter...</div>
      </div>
    );
  }

  if (!userAnswers?.identity || !userAnswers?.desired_outcome) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-[#2E2E2E] mb-4">Oops! Missing information</h1>
          <p className="text-lg text-[#5A5A5A] mb-6">We need a few details to create your profile starter.</p>
          <Button onClick={() => navigate('/onboarding')} className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90">
            Complete Onboarding
          </Button>
        </div>
      </div>
    );
  }

  const headline = generateHeadline(userAnswers.identity, userAnswers.desired_outcome);
  const summary = generateSummary(userAnswers.identity, userAnswers.desired_outcome);

  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
      {/* Header */}
      <header className="flex min-h-[72px] w-full px-6 md:px-16 items-center justify-between">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
          alt="Lansa Logo"
          className="aspect-[2.7] object-contain w-[92px]"
        />
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center gap-2"
          >
            {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            {isPreviewMode ? "Edit View" : "Preview"}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl mx-auto">
          
          {/* Success Message */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold text-[#2E2E2E] mb-4">
              🎉 Your Profile Starter is Ready!
            </h1>
            <p className="text-lg text-[#5A5A5A] max-w-2xl mx-auto">
              Based on your answers, we've created a professional profile starter. Make it yours and share it with the world!
            </p>
          </div>

          {/* Profile Preview */}
          <Card className="bg-white rounded-2xl overflow-hidden shadow-lg border-0 mb-8 animate-scale-in">
            <div className="h-3 bg-gradient-to-r from-[#FF6B4A] to-[#FF8F6B]"></div>
            
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Image Placeholder */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FF6B4A] to-[#FF8F6B] flex items-center justify-center text-white text-3xl font-bold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                </div>

                {/* Profile Content */}
                <div className="flex-1">
                  <div className="mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#2E2E2E] mb-2">
                      {user?.displayName || "Your Name"}
                    </h2>
                    <p className="text-lg text-[#FF6B4A] font-medium mb-4">
                      {headline}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="bg-[#F9F5FF] text-[#2E2E2E]">
                        {userAnswers.identity}
                      </Badge>
                      <Badge variant="secondary" className="bg-[#F9F5FF] text-[#2E2E2E]">
                        Growth-Focused
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#2E2E2E] mb-2">About</h3>
                    <p className="text-[#5A5A5A] leading-relaxed">
                      {summary}
                    </p>
                  </div>

                  {isPreviewMode && (
                    <div className="flex items-center gap-2 text-sm text-[#5A5A5A]">
                      <ExternalLink size={16} />
                      <span>This is how others will see your public profile</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleCreateProfile}
              className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90 text-white text-lg py-6 px-8 h-auto rounded-lg w-full md:w-auto animate-scale-in"
              style={{ animationDelay: '0.2s' }}
            >
              Make This My Public Profile
            </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Clear onboarding completion and restart
              if (user?.id) {
                const resetAnswers = { ...userAnswers, onboarding_completed: false };
                // Don't await this, just navigate immediately
                getUserAnswers(user.id).then(() => {
                  navigate('/onboarding', { replace: true });
                });
              } else {
                navigate('/onboarding', { replace: true });
              }
            }}
            className="text-lg py-6 px-8 h-auto rounded-lg w-full md:w-auto animate-scale-in"
            style={{ animationDelay: '0.3s' }}
          >
            Start Over
          </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-[#1A1F71]">
        © 2025 Lansa
      </footer>
    </div>
  );
}