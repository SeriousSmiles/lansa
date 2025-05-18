
import { ExperienceItem, EducationItem } from "@/hooks/profile/profileTypes";
import { Separator } from "@/components/ui/separator";
import { StaticExperienceCard } from "../experience/StaticExperienceCard";

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
  return (
    <div className="lg:col-span-8 space-y-8">
      {/* About Me */}
      {aboutText && (
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 
            className="text-2xl font-semibold mb-4"
            style={{ color: highlightColor }}
          >
            About Me
          </h2>
          <p className="text-gray-700">{aboutText}</p>
        </div>
      )}
      
      {/* Experience */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 
          className="text-2xl font-semibold mb-4"
          style={{ color: highlightColor }}
        >
          Experience
        </h2>
        {experiences.length > 0 ? (
          <div className="space-y-6">
            {experiences.map((exp) => (
              <div key={exp.id} className="border-b border-gray-200 last:border-0 pb-5 last:pb-0">
                <StaticExperienceCard
                  title={exp.title}
                  period="Present"
                  subtitle="Company"
                  description={exp.description}
                  highlightColor={highlightColor}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No experience data available</p>
        )}
      </div>
      
      {/* Education */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 
          className="text-2xl font-semibold mb-4"
          style={{ color: highlightColor }}
        >
          Education
        </h2>
        {educationItems.length > 0 ? (
          <div className="space-y-6">
            {educationItems.map((edu) => (
              <div key={edu.id} className="border-b border-gray-200 last:border-0 pb-5 last:pb-0">
                <StaticExperienceCard
                  title={edu.title}
                  period="Completed"
                  subtitle="Institution"
                  description={edu.description}
                  highlightColor={highlightColor}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No education data available</p>
        )}
      </div>
    </div>
  );
}
