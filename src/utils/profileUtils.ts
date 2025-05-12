
import { UserAnswers } from "@/services/QuestionService";
import { ExperienceItem, EducationItem } from "@/hooks/profile/profileTypes";

// Export interface declarations needed by other files
export function getSkillsBasedOnAnswers(answers: UserAnswers | null): string[] {
  const skillsMap: { [key: string]: string[] } = {
    "I want to get noticed and valued as a freelancer": ["Communication", "Self-Promotion", "Networking", "Portfolio Building", "Client Management"],
    "I'm trying to find a job that fits me": ["Interview Skills", "Resume Development", "Self-Assessment", "Job Research", "Career Planning"],
    "I want more clarity for my business/idea": ["Strategic Thinking", "Market Research", "Business Planning", "Value Proposition", "Brand Development"],
    "I'm preparing for my next move as a student": ["Academic Focus", "Professional Development", "Research Skills", "Networking", "Career Exploration"],
    "I'm not sure — I just know I want more": ["Self-Awareness", "Goal Setting", "Personal Development", "Exploration", "Reflection"],
    
    // New identity-based skills
    "Freelancer": ["Client Acquisition", "Project Management", "Self-Marketing", "Portfolio Development", "Service Pricing"],
    "Job-seeker": ["Resume Optimization", "Interview Preparation", "Personal Branding", "Networking", "Job Market Research"],
    "Student": ["Academic Excellence", "Career Planning", "Skill Development", "Networking", "Internship Strategy"],
    "Entrepreneur": ["Business Strategy", "Market Analysis", "Product Development", "Funding Strategy", "Team Building"],
    "Visionary": ["Strategic Thinking", "Communication", "Leadership", "Innovation", "Change Management"]
  };

  // Default skills if no match or answers are undefined
  let skills = ["Communication", "Problem Solving", "Strategic Thinking", "Self-Awareness", "Professional Growth"];
  
  if (answers?.identity && skillsMap[answers.identity]) {
    skills = skillsMap[answers.identity];
  } else if (answers?.question1 && skillsMap[answers.question1]) {
    skills = skillsMap[answers.question1];
  }

  return skills;
}

export function getExperienceBasedOnRole(role: string): ExperienceItem[] {
  const roleToExperience: { [key: string]: ExperienceItem[] } = {
    "Freelancer seeking recognition": [
      {
        title: "Independent Professional",
        description: "Developed expertise in delivering quality services while building a client portfolio and establishing a personal brand."
      }
    ],
    "Job seeker finding their fit": [
      {
        title: "Career Explorer",
        description: "Evaluated professional strengths and preferences to identify ideal work environments and positions that align with core values."
      }
    ],
    "Business owner seeking clarity": [
      {
        title: "Entrepreneur",
        description: "Built a business from the ground up, focusing on developing a unique value proposition and strategic market positioning."
      }
    ],
    "Student preparing for the future": [
      {
        title: "Academic Achiever",
        description: "Balanced education with professional development activities, preparing for successful transition to the workforce."
      }
    ],
    "Professional seeking clarity": [
      {
        title: "Career Developer",
        description: "Focused on personal and professional growth through continuous learning and strategic career planning."
      }
    ],
    "Visionary creating impact": [
      {
        title: "Innovation Leader",
        description: "Developed groundbreaking approaches to solving problems and creating new opportunities in the industry."
      }
    ]
  };

  return roleToExperience[role] || [
    {
      title: "Clarity Seeker",
      description: "Working on improving professional clarity and visibility through the Lansa platform."
    }
  ];
}

export function getEducationBasedOnAnswers(answers: UserAnswers | null, goal: string): EducationItem[] {
  if (!answers) return [
    {
      title: "Lansa Platform",
      description: "Professional Development Program"
    }
  ];

  // If the user mentioned being a student or identity is Student, customize the education section
  if ((answers.question1 && answers.question1.includes("student")) || answers.identity === "Student") {
    return [
      {
        title: "Current Academic Program",
        description: "Pursuing education while preparing for professional success"
      },
      {
        title: "Lansa Platform",
        description: "Supplementary professional development program"
      }
    ];
  }

  return [
    {
      title: "Lansa Platform",
      description: `Professional Development Program focusing on ${goal.toLowerCase()}`
    }
  ];
}
