import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Lightbulb, Briefcase, Laptop } from "lucide-react";

// Import images
import studentPathImage from "@/assets/onboarding/student-path.jpg";
import visionaryImage from "@/assets/onboarding/visionary.jpg";
import entrepreneurImage from "@/assets/onboarding/entrepreneur.jpg";
import freelancerImage from "@/assets/onboarding/freelancer.jpg";

export type CareerPath = 'student' | 'visionary' | 'entrepreneur' | 'freelancer';

interface CareerPathSegmentationProps {
  onSelect: (path: CareerPath) => void;
}

export function CareerPathSegmentation({ onSelect }: CareerPathSegmentationProps) {
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);

  const handleSelect = (path: CareerPath) => {
    // Only allow selection for student path for now
    if (path !== 'student') return;
    
    setSelectedPath(path);
    setTimeout(() => onSelect(path), 300);
  };

  const careerPaths = {
    student: {
      title: "Traditional Student Path",
      description: "Follow a structured journey through education and into your first career opportunities",
      features: [
        "Academic guidance & mentorship",
        "Internship & job placement support", 
        "Skill development programs",
        "Career readiness preparation"
      ],
      icon: GraduationCap,
      image: studentPathImage,
      gradient: "from-secondary to-secondary/80",
      comingSoon: false
    },
    visionary: {
      title: "Visionary",
      description: "Turn innovative ideas into reality with cutting-edge projects",
      features: ["Innovation consulting", "Trend analysis", "Creative direction"],
      icon: Lightbulb,
      image: visionaryImage,
      gradient: "from-primary to-primary/80",
      comingSoon: true
    },
    entrepreneur: {
      title: "Entrepreneur", 
      description: "Build and scale your own business ventures",
      features: ["Business mentorship", "Funding opportunities", "Network access"],
      icon: Briefcase,
      image: entrepreneurImage,
      gradient: "from-secondary to-secondary/80",
      comingSoon: true
    },
    freelancer: {
      title: "Freelancer",
      description: "Work independently with flexible project-based opportunities",
      features: ["Project matching", "Skills marketplace", "Client connections"],
      icon: Laptop,
      image: freelancerImage,
      gradient: "from-primary to-primary/80",
      comingSoon: true
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="lansa-container-wide">{/* Use Lansa container */}
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Career Path
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Tell us about your career aspirations so we can customize your Lansa experience
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
          {/* Left Column - Student Path (Larger) */}
          <div className="lg:col-span-1">
            <Card 
              className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl border-2 overflow-hidden h-full ${
                selectedPath === 'student'
                  ? 'border-secondary bg-secondary/5 shadow-xl scale-105' 
                  : 'border-border hover:border-secondary/50'
              }`}
              onClick={() => handleSelect('student')}
            >
              <div className="relative h-64 lg:h-80 overflow-hidden">
                <img 
                  src={careerPaths.student.image} 
                  alt="Student Path"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${careerPaths.student.gradient} opacity-80`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white p-4 lg:p-6">
                    <careerPaths.student.icon className="w-12 lg:w-16 h-12 lg:h-16 mx-auto mb-4" />
                    <h3 className="text-xl lg:text-2xl font-bold mb-2">{careerPaths.student.title}</h3>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4 lg:p-8">
                <p className="text-muted-foreground mb-4 lg:mb-6 text-base lg:text-lg leading-relaxed">
                  {careerPaths.student.description}
                </p>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground mb-3">What you'll get:</h4>
                  {careerPaths.student.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
                      <span className="text-muted-foreground text-sm lg:text-base">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className={`w-full mt-4 lg:mt-6 transition-all duration-300 ${
                    selectedPath === 'student' 
                      ? 'bg-secondary hover:bg-secondary/90' 
                      : 'bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary'
                  }`}
                >
                  {selectedPath === 'student' ? '✓ Selected' : 'Select This Path'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Other Options */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {(Object.entries(careerPaths) as [CareerPath, typeof careerPaths.student][])
              .filter(([key]) => key !== 'student')
              .map(([key, path]) => (
              <Card 
                key={key}
                className={`group transition-all duration-500 border-2 overflow-hidden relative ${
                  path.comingSoon 
                    ? 'cursor-not-allowed opacity-60 grayscale border-muted bg-muted/20' 
                    : `cursor-pointer hover:shadow-xl ${
                        selectedPath === key
                          ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]' 
                          : 'border-border hover:border-primary/50'
                      }`
                }`}
                onClick={() => handleSelect(key)}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-center h-auto sm:h-48">
                    {/* Coming Soon Badge */}
                    {path.comingSoon && (
                      <div className="absolute top-4 right-4 z-10 bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-medium border">
                        Coming Soon
                      </div>
                    )}
                    
                    {/* Image Section */}
                    <div className="relative w-full sm:w-80 h-48 sm:h-full overflow-hidden">
                      <img 
                        src={path.image} 
                        alt={path.title}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          path.comingSoon ? '' : 'group-hover:scale-110'
                        }`}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-r ${path.gradient} ${
                        path.comingSoon ? 'opacity-40' : 'opacity-80'
                      }`} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <path.icon className={`w-10 lg:w-12 h-10 lg:h-12 ${
                          path.comingSoon ? 'text-white/60' : 'text-white'
                        }`} />
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 p-4 lg:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                        <h3 className="text-xl lg:text-2xl font-bold text-foreground">{path.title}</h3>
                        <Button 
                          variant={path.comingSoon ? "outline" : (selectedPath === key ? "primary" : "outline")}
                          size="sm"
                          disabled={path.comingSoon}
                          className={`transition-all duration-300 self-start sm:self-auto ${
                            path.comingSoon 
                              ? 'cursor-not-allowed opacity-60' 
                              : selectedPath === key 
                                ? 'bg-primary hover:bg-primary/90' 
                                : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                          }`}
                        >
                          {path.comingSoon ? 'Coming Soon' : (selectedPath === key ? '✓ Selected' : 'Select')}
                        </Button>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 text-base lg:text-lg leading-relaxed">
                        {path.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {path.features.map((feature, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs lg:text-sm bg-muted text-muted-foreground"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
      </div>

        {/* Footer */}
        <div className="text-center mt-8 lg:mt-12">
          <p className="text-muted-foreground text-sm lg:text-base">
            Don't worry - you can always change your path later as your goals evolve
          </p>
        </div>
      </div>
    </div>
  );
}