
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUserAnswers, getProfileRole, getProfileGoal } from "@/services/QuestionService";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, GraduationCap, Award, Star, MapPin, Mail, Phone, ArrowLeft } from "lucide-react";

export default function Profile() {
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [userName, setUserName] = useState<string>("Lansa User");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      
      const answers = await getUserAnswers(user.id);
      if (answers) {
        setUserAnswers(answers);
      }
      
      // In a real app, you would fetch the user's name from their profile
      // For now we'll use a placeholder
      if (user.email) {
        setUserName(user.email.split('@')[0]);
      }
      
      setIsLoading(false);
    }
    
    loadProfile();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(253,248,242,1)] flex items-center justify-center">
        <div className="text-2xl text-[#2E2E2E]">Loading your profile...</div>
      </div>
    );
  }

  const role = getProfileRole(userAnswers?.question1);
  const goal = getProfileGoal(userAnswers?.question3);
  const blocker = userAnswers?.question2 || "Identifying my unique value proposition";

  const getSkillsBasedOnAnswers = (answers: any) => {
    const skillsMap: { [key: string]: string[] } = {
      "I want to get noticed and valued as a freelancer": ["Communication", "Self-Promotion", "Networking", "Portfolio Building", "Client Management"],
      "I'm trying to find a job that fits me": ["Interview Skills", "Resume Development", "Self-Assessment", "Job Research", "Career Planning"],
      "I want more clarity for my business/idea": ["Strategic Thinking", "Market Research", "Business Planning", "Value Proposition", "Brand Development"],
      "I'm preparing for my next move as a student": ["Academic Focus", "Professional Development", "Research Skills", "Networking", "Career Exploration"],
      "I'm not sure — I just know I want more": ["Self-Awareness", "Goal Setting", "Personal Development", "Exploration", "Reflection"]
    };

    // Default skills if no match or answers are undefined
    let skills = ["Communication", "Problem Solving", "Strategic Thinking", "Self-Awareness", "Professional Growth"];
    
    if (answers?.question1 && skillsMap[answers.question1]) {
      skills = skillsMap[answers.question1];
    }

    return skills;
  };

  const skills = getSkillsBasedOnAnswers(userAnswers);

  const getExperienceBasedOnRole = (role: string) => {
    const roleToExperience: { [key: string]: { title: string, description: string }[] } = {
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
      ]
    };

    return roleToExperience[role] || [
      {
        title: "Clarity Seeker",
        description: "Working on improving professional clarity and visibility through the Lansa platform."
      }
    ];
  };

  const experiences = getExperienceBasedOnRole(role);

  const getEducationBasedOnAnswers = (answers: any) => {
    if (!answers) return [
      {
        title: "Lansa Platform",
        description: "Professional Development Program"
      }
    ];

    // If the user mentioned being a student, customize the education section
    if (answers.question1 && answers.question1.includes("student")) {
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
        description: "Professional Development Program focusing on " + goal.toLowerCase()
      }
    ];
  };

  const education = getEducationBasedOnAnswers(userAnswers);

  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
      <header className="flex min-h-[72px] w-full px-4 md:px-16 items-center shadow-sm bg-white">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/dashboard")}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
          alt="Lansa Logo"
          className="aspect-[2.7] object-contain w-[92px]"
        />
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - About */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="overflow-hidden">
              <div className="bg-[#FF6B4A] h-24"></div>
              <div className="p-6 pt-0 -mt-12 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-[#FF6B4A] border-4 border-white flex items-center justify-center text-white text-4xl font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-2xl font-bold mt-4 text-center">{userName}</h1>
                <p className="text-[#FF6B4A] font-medium text-center">{role}</p>
                
                <div className="w-full mt-6 space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-[#FF6B4A] mr-3" />
                    <span>{user?.email || 'email@example.com'}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-[#FF6B4A] mr-3" />
                    <span>Remote / Worldwide</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-[#FF6B4A] mr-3" />
                    <span>Available on request</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Skills */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold flex items-center mb-4">
                  <Star className="h-5 w-5 text-[#FF6B4A] mr-2" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="bg-[#FFF4EE] text-[#FF6B4A] px-3 py-1 rounded-full">
                      {skill}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Goals */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold flex items-center mb-4">
                  <Award className="h-5 w-5 text-[#FF6B4A] mr-2" />
                  Professional Goal
                </h2>
                <p className="text-lg">{goal}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Experience & Education */}
          <div className="lg:col-span-8 space-y-8">
            {/* About Me */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">About Me</h2>
                <p className="mb-4">
                  Based on your onboarding answers, you identified as a {role.toLowerCase()} 
                  who wants to {goal.toLowerCase()}. You're at the beginning of your 
                  clarity journey, and we're here to help you achieve your goals.
                </p>
                <h3 className="text-lg font-semibold mb-2">My Biggest Challenge</h3>
                <blockquote className="border-l-4 border-[#FF6B4A] pl-4 italic">
                  "{blocker}"
                </blockquote>
              </CardContent>
            </Card>
            
            {/* Experience */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold flex items-center mb-6">
                  <Briefcase className="h-5 w-5 text-[#FF6B4A] mr-2" />
                  Experience
                </h2>
                
                <div className="space-y-6">
                  {experiences.map((exp, index) => (
                    <div key={index}>
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3">
                          <h3 className="text-lg font-semibold text-[#FF6B4A]">{exp.title}</h3>
                          <p className="text-gray-500">Present</p>
                        </div>
                        <div className="md:w-2/3">
                          <h4 className="font-medium">Professional Development</h4>
                          <p className="text-gray-600 mt-1">
                            {exp.description}
                          </p>
                        </div>
                      </div>
                      
                      {index < experiences.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      <h3 className="text-lg font-semibold text-[#FF6B4A]">Career Explorer</h3>
                      <p className="text-gray-500">Past</p>
                    </div>
                    <div className="md:w-2/3">
                      <h4 className="font-medium">Self-Discovery</h4>
                      <p className="text-gray-600 mt-1">
                        Explored various professional paths and opportunities 
                        to better understand strengths, weaknesses, and career aspirations.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Education */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold flex items-center mb-6">
                  <GraduationCap className="h-5 w-5 text-[#FF6B4A] mr-2" />
                  Education & Learning
                </h2>
                
                <div className="space-y-6">
                  {education.map((edu, index) => (
                    <div key={index} className="flex flex-col md:flex-row">
                      <div className="md:w-1/3">
                        <h3 className="text-lg font-semibold text-[#FF6B4A]">{edu.title}</h3>
                        <p className="text-gray-500">Present</p>
                      </div>
                      <div className="md:w-2/3">
                        <h4 className="font-medium">Professional Development Program</h4>
                        <p className="text-gray-600 mt-1">
                          {edu.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Actions Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/dashboard")} 
                className="px-8 py-6 h-auto text-lg"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        © 2025 Lansa N.V.
      </footer>
    </div>
  );
}
