import { useEffect, useRef } from 'react';
import { DiscoveryProfile } from '@/services/discoveryService';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Globe, Award, Target, BookOpen } from 'lucide-react';
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

  if (!profile) return null;

  const experiences = profile.experiences || [];
  const education = profile.education || [];
  const languages = profile.languages || [];
  const achievements = profile.achievements || [];

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto bg-muted/20 p-6 space-y-4"
      style={{ willChange: 'transform, opacity' }}
    >
      {/* About Section */}
      <div
        data-animate="about"
        className="bg-background rounded-xl border border-border/60 shadow-sm overflow-hidden"
      >
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/50 bg-muted/30">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">About</h3>
        </div>
        <div className="px-5 py-4">
          {profile.about_text ? (
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {profile.about_text}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No bio provided yet.</p>
          )}
        </div>
      </div>

      {/* Experience Section */}
      <div className="bg-background rounded-xl border border-border/60 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/50 bg-muted/30">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Experience</h3>
        </div>
        <div className="px-5 py-4 space-y-5">
          {experiences.length > 0 ? (
            experiences.slice(0, 2).map((exp: any, idx: number) => (
              <div
                key={idx}
                data-animate="experience"
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  {idx < Math.min(experiences.slice(0, 2).length, 2) - 1 && (
                    <div className="w-px flex-1 bg-border/60 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <h4 className="font-semibold text-sm text-foreground leading-snug">{exp.title}</h4>
                  <p className="text-xs text-primary font-medium mt-0.5">{exp.subtitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2">{exp.period}</p>
                  {exp.description && (
                    <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Briefcase className="w-4 h-4 opacity-40" />
              <span className="italic">No experience listed yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Education Section */}
      <div
        data-animate="education"
        className="bg-background rounded-xl border border-border/60 shadow-sm overflow-hidden"
      >
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/50 bg-muted/30">
          <GraduationCap className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Education</h3>
        </div>
        <div className="px-5 py-4 space-y-3">
          {education.length > 0 ? (
            education.map((edu: any, idx: number) => (
              <div key={idx}>
                <h4 className="font-semibold text-sm text-foreground">{edu.title}</h4>
                <p className="text-xs text-muted-foreground">{edu.description}</p>
                <p className="text-xs text-muted-foreground/70">{edu.period}</p>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <GraduationCap className="w-4 h-4 opacity-40" />
              <span className="italic">No education details available</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Languages + Achievements side by side if both exist, else full width */}
      <div className={`grid gap-4 ${languages.length > 0 && achievements.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Languages */}
        {languages.length > 0 && (
          <div className="bg-background rounded-xl border border-border/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Languages</h3>
            </div>
            <div className="px-4 py-3 flex flex-wrap gap-1.5">
              {languages.map((lang: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="bg-background rounded-xl border border-border/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
              <Award className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Achievements</h3>
            </div>
            <div className="px-4 py-3 space-y-2">
              {achievements.map((achievement: any, idx: number) => (
                <div
                  key={idx}
                  data-animate="achievement"
                  className="text-xs"
                >
                  <p className="font-semibold text-foreground">{achievement.title}</p>
                  {achievement.description && (
                    <p className="text-muted-foreground line-clamp-2">{achievement.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Professional Goals */}
      {profile.professional_goal && (
        <div className="bg-background rounded-xl border border-border/60 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/50 bg-muted/30">
            <Target className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Professional Goals</h3>
          </div>
          <div className="px-5 py-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                {profile.professional_goal}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
