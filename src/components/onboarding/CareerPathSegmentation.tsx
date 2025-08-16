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
      gradient: "from-secondary to-secondary/80"
    },
    visionary: {
      title: "Visionary",
      description: "Turn innovative ideas into reality with cutting-edge projects",
      features: ["Innovation consulting", "Trend analysis", "Creative direction"],
      icon: Lightbulb,
      image: visionaryImage,
      gradient: "from-primary to-primary/80"
    },
    entrepreneur: {
      title: "Entrepreneur", 
      description: "Build and scale your own business ventures",
      features: ["Business mentorship", "Funding opportunities", "Network access"],
      icon: Briefcase,
      image: entrepreneurImage,
      gradient: "from-secondary to-secondary/80"
    },
    freelancer: {
      title: "Freelancer",
      description: "Work independently with flexible project-based opportunities",
      features: ["Project matching", "Skills marketplace", "Client connections"],
      icon: Laptop,
      image: freelancerImage,
      gradient: "from-primary to-primary/80"
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Choose Your Career Path
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Tell us about your career aspirations so we can customize your Lansa experience
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
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
            <div className="relative h-80 overflow-hidden">
              <img 
                src={careerPaths.student.image} 
                alt="Student Path"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${careerPaths.student.gradient} opacity-80`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <careerPaths.student.icon className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">{careerPaths.student.title}</h3>
                </div>
              </div>
            </div>
            
            <CardContent className="p-8">
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                {careerPaths.student.description}
              </p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground mb-3">What you'll get:</h4>
                {careerPaths.student.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className={`w-full mt-6 transition-all duration-300 ${
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
        <div className="lg:col-span-2 space-y-6">
          {(Object.entries(careerPaths) as [CareerPath, typeof careerPaths.student][])
            .filter(([key]) => key !== 'student')
            .map(([key, path]) => (
            <Card 
              key={key}
              className={`group cursor-pointer transition-all duration-500 hover:shadow-xl border-2 overflow-hidden ${
                selectedPath === key
                  ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleSelect(key)}
            >
              <CardContent className="p-0">
                <div className="flex items-center h-48">
                  {/* Image Section */}
                  <div className="relative w-80 h-full overflow-hidden">
                    <img 
                      src={path.image} 
                      alt={path.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${path.gradient} opacity-80`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <path.icon className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="flex-1 p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-foreground">{path.title}</h3>
                      <Button 
                        variant={selectedPath === key ? "primary" : "outline"}
                        size="sm"
                        className={`transition-all duration-300 ${
                          selectedPath === key 
                            ? 'bg-primary hover:bg-primary/90' 
                            : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                        }`}
                      >
                        {selectedPath === key ? '✓ Selected' : 'Select'}
                      </Button>
                    </div>
                    
                    <p className="text-muted-foreground mb-4 text-lg leading-relaxed">
                      {path.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {path.features.map((feature, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground"
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
      <div className="text-center mt-12">
        <p className="text-muted-foreground">
          Don't worry - you can always change your path later as your goals evolve
        </p>
      </div>
    </div>
  );
}