
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { useRef, useEffect } from "react";
import { animateElementsSequence } from "@/utils/animationHelpers";

interface OverviewTabProps {
  userName: string;
  role: string;
  goal: string;
  insight: string;
  highlightActions: boolean;
}

export function OverviewTab({ userName, role, goal, insight, highlightActions }: OverviewTabProps) {
  const recommendedActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate recommended actions cards with staggered delay
    if (recommendedActionsRef.current) {
      const cards = recommendedActionsRef.current.querySelectorAll('.animated-card');
      animateElementsSequence(cards, {
        opacity: [0, 1],
        y: [20, 0],
        stagger: 0.1,
        duration: 0.5,
        delay: 0.3,
        ease: "power2.out"
      });
    }
  }, []);
  
  // Get personalized action points based on role
  const actionPoints = getPersonalizedActionPoints(role);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <AnimatedCard delay={0.1} className="h-auto hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg md:text-xl">Your Profile</CardTitle>
            <CardDescription>Based on your onboarding answers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-base md:text-lg">{role}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Goal</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-base md:text-lg">{goal}</p>
                </div>
              </div>
              <div className="pt-1">
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="btn-animate">View Full Profile</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
        
        <AnimatedCard delay={0.2} className="h-auto hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg md:text-xl">Your Insight</CardTitle>
            <CardDescription>Personalized for your journey</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base md:text-lg italic">"{insight}"</p>
          </CardContent>
        </AnimatedCard>
      </div>
      
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold animate-fade-in">Recommended Actions</h2>
        {highlightActions && (
          <div className="bg-[#FF6B4A]/20 text-[#FF6B4A] px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            Start here
          </div>
        )}
      </div>
      
      <div 
        ref={recommendedActionsRef}
        className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${
          highlightActions ? 'ring-2 ring-[#FF6B4A] ring-offset-4 rounded-lg p-4 animate-[scale-in_0.5s_ease-out]' : ''
        }`}
      >
        {actionPoints.map((action, index) => (
          <RecommendedActionCard
            key={index}
            title={action.title}
            description={action.description}
            buttonText={action.buttonText}
            delay={0.3 + (index * 0.1)}
          />
        ))}
      </div>
    </>
  );
}

interface RecommendedActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  delay: number;
}

function RecommendedActionCard({ title, description, buttonText, delay }: RecommendedActionCardProps) {
  return (
    <AnimatedCard delay={delay} className="animated-card h-auto hover-scale">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm">{description}</p>
        <Button variant="outline" size="sm" className="w-full btn-animate">{buttonText}</Button>
      </CardContent>
    </AnimatedCard>
  );
}

interface ActionPoint {
  title: string;
  description: string;
  buttonText: string;
}

function getPersonalizedActionPoints(role: string): ActionPoint[] {
  // Default action points
  const defaultActions: ActionPoint[] = [
    {
      title: "Define Your Message",
      description: "Clarify how you talk about yourself and your work to resonate with your audience.",
      buttonText: "Start Exercise"
    },
    {
      title: "Build Your Presence",
      description: "Create a standout online profile that showcases your unique value.",
      buttonText: "Start Building"
    },
    {
      title: "Track Progress",
      description: "See your journey toward greater clarity and professional visibility.",
      buttonText: "View Progress"
    }
  ];
  
  // Role-specific action points
  switch (role) {
    case "Freelancer seeking recognition":
      return [
        {
          title: "Craft Your Pitch",
          description: "Define your unique value proposition that makes clients choose you over competitors.",
          buttonText: "Create Pitch"
        },
        {
          title: "Portfolio Optimization",
          description: "Showcase your best work in a way that attracts your ideal clients.",
          buttonText: "Optimize Now"
        },
        {
          title: "Pricing Strategy",
          description: "Set rates that reflect your value and position you properly in the market.",
          buttonText: "Set Strategy"
        },
        {
          title: "Client Communication",
          description: "Develop templates and systems for professional client interactions.",
          buttonText: "Develop System"
        },
        {
          title: "Visibility Plan",
          description: "Create a strategy to become more visible to your target client base.",
          buttonText: "Create Plan"
        }
      ];
    
    case "Job seeker finding their fit":
      return [
        {
          title: "Resume Revamp",
          description: "Transform your resume to highlight your unique strengths and value.",
          buttonText: "Start Revamp"
        },
        {
          title: "Interview Storytelling",
          description: "Develop compelling stories that showcase your experience and capabilities.",
          buttonText: "Craft Stories"
        },
        {
          title: "Network Building",
          description: "Create a strategic plan to connect with professionals in your target roles.",
          buttonText: "Build Network"
        },
        {
          title: "Role Alignment",
          description: "Identify the roles that best match your skills, values, and aspirations.",
          buttonText: "Find Alignment"
        },
        {
          title: "Application Strategy",
          description: "Develop a targeted approach to job applications that stands out.",
          buttonText: "Create Strategy"
        }
      ];

    case "Student preparing for the future":
      return [
        {
          title: "Career Path Exploration",
          description: "Research potential career paths aligned with your interests and strengths.",
          buttonText: "Explore Paths"
        },
        {
          title: "Skills Inventory",
          description: "Identify and document your marketable skills and knowledge gaps.",
          buttonText: "Build Inventory"
        },
        {
          title: "Experience Design",
          description: "Plan strategic experiences to build your resume while still in school.",
          buttonText: "Design Plan"
        },
        {
          title: "Professional Brand",
          description: "Start building your professional identity before graduation.",
          buttonText: "Build Brand"
        },
        {
          title: "Mentor Connection",
          description: "Find mentors who can guide your transition from education to career.",
          buttonText: "Find Mentors"
        }
      ];
      
    case "Business owner seeking clarity":
      return [
        {
          title: "Value Proposition",
          description: "Refine how you communicate your business's unique value to customers.",
          buttonText: "Refine Value"
        },
        {
          title: "Target Market Definition",
          description: "Clearly define your ideal customer and their specific needs.",
          buttonText: "Define Market"
        },
        {
          title: "Messaging Framework",
          description: "Create consistent language to talk about your business across channels.",
          buttonText: "Create Framework"
        },
        {
          title: "Business Roadmap",
          description: "Plot your next growth milestones with achievable timelines.",
          buttonText: "Build Roadmap"
        },
        {
          title: "Competitive Analysis",
          description: "Understand your position in the market and identify opportunities.",
          buttonText: "Analyze Market"
        }
      ];
      
    case "Visionary creating impact":
      return [
        {
          title: "Vision Articulation",
          description: "Transform your big ideas into clear, compelling language that inspires others.",
          buttonText: "Articulate Vision"
        },
        {
          title: "Impact Framework",
          description: "Define how you'll measure the success and impact of your vision.",
          buttonText: "Create Framework"
        },
        {
          title: "Stakeholder Mapping",
          description: "Identify key allies and influencers needed to bring your vision to life.",
          buttonText: "Map Stakeholders"
        },
        {
          title: "Resource Strategy",
          description: "Plan how to acquire the resources needed to execute your vision.",
          buttonText: "Plan Strategy"
        },
        {
          title: "Narrative Development",
          description: "Craft the story that will help others understand and support your vision.",
          buttonText: "Develop Narrative"
        }
      ];
      
    default:
      return defaultActions;
  }
}
