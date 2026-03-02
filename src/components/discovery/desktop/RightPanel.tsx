import { DiscoveryProfile } from '@/services/discoveryService';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Globe, Award, Target, BookOpen } from 'lucide-react';

interface RightPanelProps {
  profile: DiscoveryProfile;
}

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/40">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  );
}

export function RightPanel({ profile }: RightPanelProps) {
  if (!profile) return null;

  const experiences = profile.experiences || [];
  const education = profile.education || [];
  const languages = profile.languages || [];
  const achievements = profile.achievements || [];

  return (
    <div className="h-full overflow-y-auto bg-muted/20 p-5 space-y-3">

      {/* About */}
      <SectionCard icon={<BookOpen className="w-4 h-4" />} title="About">
        {profile.about_text ? (
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {profile.about_text}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No bio provided yet.</p>
        )}
      </SectionCard>

      {/* Experience */}
      <SectionCard icon={<Briefcase className="w-4 h-4" />} title="Experience">
        {experiences.length > 0 ? (
          <div className="space-y-4">
            {experiences.slice(0, 3).map((exp: any, idx: number) => (
              <div key={idx} className="flex gap-3">
                {/* Timeline */}
                <div className="flex flex-col items-center pt-1">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  {idx < Math.min(experiences.length, 3) - 1 && (
                    <div className="w-px flex-1 bg-border mt-1.5 min-h-[20px]" />
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm font-semibold text-foreground leading-snug">{exp.title}</p>
                  <p className="text-xs font-medium text-primary mt-0.5">{exp.subtitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{exp.period}</p>
                  {exp.description && (
                    <p className="text-xs text-foreground/65 leading-relaxed mt-1 line-clamp-2">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="w-4 h-4 opacity-40" />
            <span className="italic text-xs">No experience listed yet</span>
          </div>
        )}
      </SectionCard>

      {/* Education */}
      <SectionCard icon={<GraduationCap className="w-4 h-4" />} title="Education">
        {education.length > 0 ? (
          <div className="space-y-3">
            {education.map((edu: any, idx: number) => (
              <div key={idx} className={idx > 0 ? 'pt-3 border-t border-border' : ''}>
                <p className="text-sm font-semibold text-foreground">{edu.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{edu.description}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{edu.period}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="w-4 h-4 opacity-40" />
            <span className="italic text-xs">No education details available</span>
          </div>
        )}
      </SectionCard>

      {/* Languages + Achievements row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Languages */}
        <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Languages</h3>
          </div>
          <div className="px-4 py-3">
            {languages.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {languages.map((lang: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Not specified</p>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
            <Award className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Achievements</h3>
          </div>
          <div className="px-4 py-3">
            {achievements.length > 0 ? (
              <div className="space-y-2">
                {achievements.slice(0, 2).map((a: any, idx: number) => (
                  <div key={idx}>
                    <p className="text-xs font-semibold text-foreground">{a.title}</p>
                    {a.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{a.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">None listed</p>
            )}
          </div>
        </div>
      </div>

      {/* Professional Goals */}
      <SectionCard icon={<Target className="w-4 h-4" />} title="Professional Goals">
        {profile.professional_goal ? (
          <div className="border-l-[3px] border-primary pl-3">
            <p className="text-sm text-foreground/80 leading-relaxed italic">
              {profile.professional_goal}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No professional goal shared yet.</p>
        )}
      </SectionCard>
    </div>
  );
}
