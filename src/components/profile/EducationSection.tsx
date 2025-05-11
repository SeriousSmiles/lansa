
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

interface EducationItem {
  title: string;
  description: string;
}

interface EducationSectionProps {
  education: EducationItem[];
}

export function EducationSection({ education }: EducationSectionProps) {
  return (
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
  );
}
