import { useEffect, useRef } from 'react';
import { DiscoveryProfile } from '@/services/discoveryService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Globe, Award } from 'lucide-react';
import { candidatePanelAnimations } from '@/utils/candidatePanelAnimations';

interface RightPanelProps {
  profile: DiscoveryProfile;
}

export function RightPanel({ profile }: RightPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && profile?.user_id) {
      candidatePanelAnimations.enterRightPanel(containerRef.current);
      candidatePanelAnimations.staggerRightPanelSections(containerRef.current);
    }
  }, [profile?.user_id]);

  // Guard against undefined profile - after hooks
  if (!profile) {
    return null;
  }

  const experiences = profile.experiences || [];
  const education = profile.education || [];
  const languages = profile.languages || [];
  const achievements = profile.achievements || [];

  return (
    <div
      ref={containerRef}
      className="bg-muted/30 rounded-lg p-10 h-full overflow-y-auto"
      style={{ willChange: 'transform, opacity' }}
    >
      {/* About Section */}
      {profile.about_text && (
        <Card className="mb-6" data-animate="about">
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {profile.about_text}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Experience Section */}
      {experiences.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {experiences.slice(0, 2).map((exp: any, idx: number) => (
              <div
                key={idx}
                className="border-l-2 border-primary/20 pl-4"
                data-animate="experience"
              >
                <h4 className="font-semibold text-base">{exp.title}</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  {exp.subtitle}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {exp.period}
                </p>
                {exp.description && (
                  <p className="text-sm text-foreground/70 line-clamp-3">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <Card className="mb-6" data-animate="education">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {education.map((edu: any, idx: number) => (
              <div key={idx}>
                <h4 className="font-semibold text-sm">{edu.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {edu.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {edu.period}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Languages Section */}
      {languages.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang: string, idx: number) => (
                <Badge key={idx} variant="outline">
                  {lang}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5" />
              Featured Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {achievements.map((achievement: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-background rounded-md border border-border"
                data-animate="achievement"
              >
                <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
                {achievement.description && (
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Professional Goals */}
      {profile.professional_goal && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Professional Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-foreground/80">
              {profile.professional_goal}
            </blockquote>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
