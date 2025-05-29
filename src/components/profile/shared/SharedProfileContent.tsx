
import { ExperienceItem, EducationItem } from "@/hooks/profile/profileTypes";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Briefcase } from "lucide-react";

interface SharedProfileContentProps {
  aboutText: string;
  experiences: ExperienceItem[];
  educationItems: EducationItem[];
  highlightColor?: string;
}

export function SharedProfileContent({
  aboutText,
  experiences,
  educationItems,
  highlightColor = "#FF6B4A"
}: SharedProfileContentProps) {
  const formatYearRange = (startYear?: number, endYear?: number | null) => {
    if (!startYear) return "";
    const endDisplay = endYear === null ? "Present" : endYear;
    return `${startYear} - ${endDisplay}`;
  };

  return (
    <div className="lg:col-span-8 space-y-8">
      {/* About Me */}
      {aboutText && (
        <Card>
          <CardContent className="pt-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: highlightColor }}
            >
              About Me
            </h2>
            <p className="text-gray-700">{aboutText}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Experience */}
      <Card>
        <CardContent className="pt-6">
          <h2 
            className="text-2xl font-semibold mb-4 flex items-center"
            style={{ color: highlightColor }}
          >
            <Briefcase className="h-5 w-5 mr-2" />
            Experience
          </h2>
          {experiences.length > 0 ? (
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <div key={exp.id || index} className="border-b border-gray-200 last:border-0 pb-5 last:pb-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{exp.title}</h3>
                      {(exp.startYear || exp.endYear !== undefined) && (
                        <span className="text-sm text-muted-foreground">
                          {formatYearRange(exp.startYear, exp.endYear)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No experience data available</p>
          )}
        </CardContent>
      </Card>
      
      {/* Education */}
      <Card>
        <CardContent className="pt-6">
          <h2 
            className="text-2xl font-semibold mb-4 flex items-center"
            style={{ color: highlightColor }}
          >
            <GraduationCap className="h-5 w-5 mr-2" />
            Education
          </h2>
          {educationItems.length > 0 ? (
            <div className="space-y-6">
              {educationItems.map((edu, index) => (
                <div key={edu.id || index} className="border-b border-gray-200 last:border-0 pb-5 last:pb-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{edu.title}</h3>
                      {(edu.startYear || edu.endYear !== undefined) && (
                        <span className="text-sm text-muted-foreground">
                          {formatYearRange(edu.startYear, edu.endYear)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{edu.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No education data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
