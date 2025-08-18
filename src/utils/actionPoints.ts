
interface ActionPoint {
  title: string;
  description: string;
  buttonText: string;
  action: string; // URL path or action type
  actionType: 'navigate' | 'modal' | 'external';
  priority?: number; // For ordering
}

export function getPersonalizedActionPoints(role: string): ActionPoint[] {
  // Default action points
  const defaultActions: ActionPoint[] = [
    {
      title: "Complete Your Profile",
      description: "Build a professional profile that showcases your unique value and attracts opportunities.",
      buttonText: "Complete Profile",
      action: "/profile",
      actionType: "navigate",
      priority: 1
    },
    {
      title: "Get AI Career Insights",
      description: "Receive personalized recommendations to accelerate your professional growth.",
      buttonText: "Get Insights",
      action: "ai-coach",
      actionType: "modal",
      priority: 2
    },
    {
      title: "Generate Professional Resume",
      description: "Create a polished PDF resume from your profile in seconds.",
      buttonText: "Generate Resume",
      action: "pdf-download",
      actionType: "modal",
      priority: 3
    }
  ];
  
  // Role-specific action points
  switch (role) {
    case "Freelancer seeking recognition":
      return [
        {
          title: "Complete Your Professional Profile",
          description: "Showcase your expertise and build trust with potential clients through a complete profile.",
          buttonText: "Complete Profile",
          action: "/profile",
          actionType: "navigate",
          priority: 1
        },
        {
          title: "Generate Portfolio Resume",
          description: "Create a professional PDF showcasing your skills and experience for client proposals.",
          buttonText: "Generate Resume",
          action: "pdf-download",
          actionType: "modal",
          priority: 2
        },
        {
          title: "Get AI Pricing Insights",
          description: "Receive personalized recommendations on positioning and pricing your services.",
          buttonText: "Get Insights",
          action: "ai-coach",
          actionType: "modal",
          priority: 3
        },
        {
          title: "Share Professional Profile",
          description: "Create a shareable link to your professional profile for client outreach.",
          buttonText: "Share Profile",
          action: "share-profile",
          actionType: "modal",
          priority: 4
        },
        {
          title: "Explore Resources",
          description: "Access curated content and tools to help grow your freelance business.",
          buttonText: "Explore Content",
          action: "/content",
          actionType: "navigate",
          priority: 5
        }
      ];
    
    case "Job seeker finding their fit":
      return [
        {
          title: "Build Your Professional Profile",
          description: "Create a compelling profile that highlights your strengths and attracts recruiters.",
          buttonText: "Build Profile",
          action: "/profile",
          actionType: "navigate",
          priority: 1
        },
        {
          title: "Generate Professional Resume",
          description: "Create an ATS-friendly PDF resume optimized for job applications.",
          buttonText: "Generate Resume",
          action: "pdf-download",
          actionType: "modal",
          priority: 2
        },
        {
          title: "Discover Career Opportunities",
          description: "Find roles and opportunities that match your skills and career aspirations.",
          buttonText: "Discover Jobs",
          action: "/discovery",
          actionType: "navigate",
          priority: 3
        },
        {
          title: "Get AI Career Coaching",
          description: "Receive personalized advice on interview prep, networking, and career strategy.",
          buttonText: "Get Coaching",
          action: "ai-coach",
          actionType: "modal",
          priority: 4
        },
        {
          title: "Complete Growth Challenges",
          description: "Develop key skills and track your progress toward career readiness.",
          buttonText: "Start Challenge",
          action: "growth-card",
          actionType: "modal",
          priority: 5
        }
      ];

    case "Student preparing for the future":
      return [
        {
          title: "Complete Your Student Profile",
          description: "Build a professional profile showcasing your education, skills, and career goals.",
          buttonText: "Complete Profile",
          action: "/profile",
          actionType: "navigate",
          priority: 1
        },
        {
          title: "Complete Daily Growth Challenge",
          description: "Develop essential career skills through our 90-day transformation program.",
          buttonText: "Start Challenge",
          action: "growth-card",
          actionType: "modal",
          priority: 2
        },
        {
          title: "Generate Student Resume",
          description: "Create a professional resume highlighting your education and achievements.",
          buttonText: "Generate Resume",
          action: "pdf-download",
          actionType: "modal",
          priority: 3
        },
        {
          title: "Get AI Career Guidance",
          description: "Receive personalized advice on career paths, skill development, and opportunities.",
          buttonText: "Get Guidance",
          action: "ai-coach",
          actionType: "modal",
          priority: 4
        },
        {
          title: "Explore Career Resources",
          description: "Access curated content to help you transition from student to professional.",
          buttonText: "Explore Resources",
          action: "/content",
          actionType: "navigate",
          priority: 5
        }
      ];
      
    case "Business owner seeking clarity":
      return [
        {
          title: "Build Your Business Profile",
          description: "Create a professional profile that clearly communicates your business value.",
          buttonText: "Build Profile",
          action: "/profile",
          actionType: "navigate",
          priority: 1
        },
        {
          title: "Get AI Business Insights",
          description: "Receive personalized recommendations for messaging, positioning, and growth.",
          buttonText: "Get Insights",
          action: "ai-coach",
          actionType: "modal",
          priority: 2
        },
        {
          title: "Generate Executive Resume",
          description: "Create a professional overview of your business leadership and achievements.",
          buttonText: "Generate Resume",
          action: "pdf-download",
          actionType: "modal",
          priority: 3
        },
        {
          title: "Complete Business Challenges",
          description: "Work through strategic exercises to clarify your business direction.",
          buttonText: "Start Challenge",
          action: "growth-card",
          actionType: "modal",
          priority: 4
        },
        {
          title: "Access Business Resources",
          description: "Explore curated content for business owners and entrepreneurs.",
          buttonText: "Explore Content",
          action: "/content",
          actionType: "navigate",
          priority: 5
        }
      ];
      
    case "Visionary creating impact":
      return [
        {
          title: "Build Your Visionary Profile",
          description: "Create a compelling profile that articulates your vision and impact goals.",
          buttonText: "Build Profile",
          action: "/profile",
          actionType: "navigate",
          priority: 1
        },
        {
          title: "Get AI Vision Coaching",
          description: "Receive guidance on articulating, planning, and executing your vision.",
          buttonText: "Get Coaching",
          action: "ai-coach",
          actionType: "modal",
          priority: 2
        },
        {
          title: "Generate Impact Resume",
          description: "Create a professional overview showcasing your vision and achievements.",
          buttonText: "Generate Resume",
          action: "pdf-download",
          actionType: "modal",
          priority: 3
        },
        {
          title: "Complete Vision Challenges",
          description: "Work through strategic exercises to clarify and strengthen your impact strategy.",
          buttonText: "Start Challenge",
          action: "growth-card",
          actionType: "modal",
          priority: 4
        },
        {
          title: "Share Your Vision",
          description: "Create a shareable profile to attract supporters and collaborators.",
          buttonText: "Share Profile",
          action: "share-profile",
          actionType: "modal",
          priority: 5
        }
      ];
      
    default:
      return defaultActions;
  }
}
