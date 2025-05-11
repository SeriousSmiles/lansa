
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Briefcase } from "lucide-react";

interface ExperienceItem {
  title: string;
  description: string;
}

interface ExperienceSectionProps {
  experiences: ExperienceItem[];
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  return (
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
  );
}
