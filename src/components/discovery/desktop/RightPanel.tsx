import React from 'react';
import { DiscoveryProfile } from '@/services/discoveryService';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, BarChart2, Award } from 'lucide-react';

interface RightPanelProps {
  profile: DiscoveryProfile;
}

// Helper: convert hex to r,g,b values for rgba usage
function hexToRgb(hex: string): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '100,100,100';
  return `${r},${g},${b}`;
}

function SectionCard({
  icon,
  title,
  children,
  accentColor,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accentColor?: string;
}) {
  const rgb = accentColor ? hexToRgb(accentColor) : null;
  const headerStyle = rgb
    ? { backgroundColor: `rgba(${rgb}, 0.10)` }
    : undefined;
  const iconStyle = rgb ? { color: accentColor } : undefined;

  return (
    <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
      <div
        className="flex items-center gap-2 px-5 py-3 border-b border-border"
        style={headerStyle}
      >
        <span style={iconStyle} className={rgb ? '' : 'text-muted-foreground'}>
          {icon}
        </span>
        <h3
          className="text-sm font-semibold"
          style={rgb ? { color: accentColor } : undefined}
        >
          {title}
        </h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

export function RightPanel({ profile }: RightPanelProps) {
  if (!profile) return null;

  const experiences = profile.experiences || [];
  const education = profile.education || [];
  const achievements = profile.achievements || [];
  const accentColor = profile.highlight_color || '#6366f1';
  const rgb = hexToRgb(accentColor);

  // Quick stats
  const skillsCount = (profile.skills || []).length;
  const rolesCount = experiences.length;
  const educationLabel = education.length > 0 ? education[0].title : null;
  const languages = profile.languages || [];

  return (
    <div
      className="h-full overflow-y-auto p-5 space-y-3"
      style={{ backgroundColor: `rgba(${rgb}, 0.05)` }}
    >
      {/* Quick Stats Strip */}
      <div
        className="rounded-xl border border-border shadow-sm bg-background overflow-hidden"
      >
        <div
          className="flex items-center gap-2 px-5 py-3 border-b border-border"
          style={{ backgroundColor: `rgba(${rgb}, 0.10)` }}
        >
          <BarChart2 className="w-4 h-4" style={{ color: accentColor }} />
          <h3 className="text-sm font-semibold" style={{ color: accentColor }}>
            Profile at a Glance
          </h3>
        </div>
        <div className="px-5 py-3 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">{skillsCount}</span>
            <span className="text-xs text-muted-foreground">skill{skillsCount !== 1 ? 's' : ''}</span>
          </div>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">
              {rolesCount > 0 ? rolesCount : 'No'}
            </span>
            <span className="text-xs text-muted-foreground">
              {rolesCount === 1 ? 'role' : 'roles'}
            </span>
          </div>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              {educationLabel || 'No education listed'}
            </span>
          </div>
          {languages.length > 0 && (
            <>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">{languages.length}</span>
                <span className="text-xs text-muted-foreground">language{languages.length !== 1 ? 's' : ''}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Experience */}
      <SectionCard icon={<Briefcase className="w-4 h-4" />} title="Experience" accentColor={accentColor}>
        {experiences.length > 0 ? (
          <div className="space-y-4">
            {experiences.slice(0, 3).map((exp: any, idx: number) => (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                  {idx < Math.min(experiences.length, 3) - 1 && (
                    <div className="w-px flex-1 bg-border mt-1.5 min-h-[20px]" />
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm font-semibold text-foreground leading-snug">{exp.title}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: accentColor }}>{exp.subtitle}</p>
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
      <SectionCard icon={<GraduationCap className="w-4 h-4" />} title="Education" accentColor={accentColor}>
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

      {/* Achievements */}
      {achievements.length > 0 && (
        <SectionCard icon={<Award className="w-4 h-4" />} title="Achievements" accentColor={accentColor}>
          <div className="space-y-3">
            {achievements.map((a: any, idx: number) => (
              <div key={idx} className={idx > 0 ? 'pt-3 border-t border-border' : ''}>
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                {a.organization && (
                  <p className="text-xs font-medium mt-0.5" style={{ color: accentColor }}>{a.organization}</p>
                )}
                {a.description && (
                  <p className="text-xs text-foreground/65 leading-relaxed mt-1">{a.description}</p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

    </div>
  );
}
