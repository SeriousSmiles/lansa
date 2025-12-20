import { ExperienceItem, EducationItem } from "@/hooks/profile/profileTypes";
import { AchievementItem, CertificationItem } from "@/hooks/useSharedProfileData";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Briefcase, Award, BadgeCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SharedProfileContentProps {
  aboutText: string;
  experiences: ExperienceItem[];
  educationItems: EducationItem[];
  achievements?: AchievementItem[];
  certifications?: CertificationItem[];
  highlightColor?: string;
}

export function SharedProfileContent({
  aboutText,
  experiences,
  educationItems,
  achievements = [],
  certifications = [],
  highlightColor = "#FF6B4A"
}: SharedProfileContentProps) {
  const formatYearRange = (startYear?: number, endYear?: number | null) => {
    if (!startYear) return "";
    const endDisplay = endYear === null ? "Present" : endYear;
    return `${startYear} - ${endDisplay}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
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
            <p className="text-muted-foreground">{aboutText}</p>
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
                <div key={exp.id || index} className="border-b border-border last:border-0 pb-5 last:pb-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{exp.title}</h3>
                      {(exp.startYear || exp.endYear !== undefined) && (
                        <span className="text-sm text-muted-foreground">
                          {formatYearRange(exp.startYear, exp.endYear)}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No experience data available</p>
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
                <div key={edu.id || index} className="border-b border-border last:border-0 pb-5 last:pb-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{edu.title}</h3>
                      {(edu.startYear || edu.endYear !== undefined) && (
                        <span className="text-sm text-muted-foreground">
                          {formatYearRange(edu.startYear, edu.endYear)}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{edu.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No education data available</p>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      {certifications.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 
              className="text-2xl font-semibold mb-4 flex items-center"
              style={{ color: highlightColor }}
            >
              <BadgeCheck className="h-5 w-5 mr-2" />
              Certifications
            </h2>
            <div className="space-y-6">
              {certifications.map((cert, index) => (
                <div key={cert.id || index} className="border-b border-border last:border-0 pb-5 last:pb-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{cert.title}</h3>
                      {cert.issue_date && (
                        <span className="text-sm text-muted-foreground">
                          {formatDate(cert.issue_date)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium" style={{ color: highlightColor }}>
                      {cert.issuer}
                    </p>
                    {cert.credential_id && (
                      <p className="text-xs text-muted-foreground">
                        Credential ID: {cert.credential_id}
                      </p>
                    )}
                    {cert.description && (
                      <p className="text-muted-foreground">{cert.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 
              className="text-2xl font-semibold mb-4 flex items-center"
              style={{ color: highlightColor }}
            >
              <Award className="h-5 w-5 mr-2" />
              Achievements
            </h2>
            <div className="space-y-6">
              {achievements.map((ach, index) => (
                <div key={ach.id || index} className="border-b border-border last:border-0 pb-5 last:pb-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{ach.title}</h3>
                        {ach.is_featured && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      {ach.date_achieved && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(ach.date_achieved)}
                        </span>
                      )}
                    </div>
                    {ach.organization && (
                      <p className="text-sm font-medium" style={{ color: highlightColor }}>
                        {ach.organization}
                      </p>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {ach.type}
                    </Badge>
                    <p className="text-muted-foreground">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
