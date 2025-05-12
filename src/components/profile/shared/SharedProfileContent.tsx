
import { ExperienceItem, EducationItem } from "@/utils/profileUtils";
import { Separator } from "@/components/ui/separator";

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
        {experiences.map((exp) => (
          <div key={exp.id} className="mb-4 last:mb-0">
            <h3 className="text-lg font-medium">{exp.title}</h3>
            <p className="text-gray-700">{exp.description}</p>
          </div>
        ))}
      </div>
      
      {/* Education */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 
          className="text-2xl font-semibold mb-4"
          style={{ color: highlightColor }}
        >
          Education
        </h2>
        {educationItems.map((edu) => (
          <div key={edu.id} className="mb-4 last:mb-0">
            <h3 className="text-lg font-medium">{edu.title}</h3>
            <p className="text-gray-700">{edu.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
