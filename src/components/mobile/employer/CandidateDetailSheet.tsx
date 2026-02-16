import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin, Briefcase, GraduationCap, Award, Globe, User,
  Heart, X, Zap
} from "lucide-react";
import type { DiscoveryProfile } from "@/services/discoveryService";

interface CandidateDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: DiscoveryProfile | null;
  onAction: (direction: 'left' | 'right' | 'nudge') => void;
}

export function CandidateDetailSheet({
  open,
  onOpenChange,
  profile,
  onAction,
}: CandidateDetailSheetProps) {
  if (!profile) return null;

  const skillNames: string[] = Array.isArray(profile.skills)
    ? profile.skills.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
    : [];

  const languageNames: string[] = Array.isArray(profile.languages)
    ? profile.languages.map((l: any) => (typeof l === 'string' ? l : l?.name)).filter(Boolean)
    : [];

  const accentColor = profile.highlight_color || 'hsl(var(--primary))';

  const handleAction = (direction: 'left' | 'right' | 'nudge') => {
    onAction(direction);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh] rounded-t-2xl">
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/30 my-3" />

        <div className="overflow-y-auto px-5 pb-32">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="w-16 h-16 ring-2 ring-border shadow-md flex-shrink-0">
              <AvatarImage src={profile.profile_image} alt={profile.name} />
              <AvatarFallback
                style={{ backgroundColor: accentColor }}
                className="text-white text-xl font-semibold"
              >
                {profile.name?.charAt(0) || <User className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground truncate">{profile.name}</h2>
              <p className="text-muted-foreground text-sm">{profile.title}</p>
              {profile.location && (
                <p className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </p>
              )}
            </div>
          </div>

          {/* About */}
          {profile.about_text && (
            <Section title="About">
              <p className="text-muted-foreground text-sm leading-relaxed">{profile.about_text}</p>
            </Section>
          )}

          {/* Skills */}
          {skillNames.length > 0 && (
            <Section title="Skills">
              <div className="flex flex-wrap gap-2">
                {skillNames.map((skill, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-xs font-medium"
                    style={{
                      backgroundColor: `${accentColor}12`,
                      color: accentColor,
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          {/* Experience */}
          {profile.experiences && profile.experiences.length > 0 && (
            <Section title="Experience" icon={<Briefcase className="w-4 h-4" />}>
              <div className="space-y-3">
                {profile.experiences.map((exp, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm font-semibold text-foreground">{exp.title}</p>
                    <p className="text-xs text-muted-foreground">{exp.subtitle}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{exp.period}</p>
                    {exp.description && (
                      <p className="text-xs text-muted-foreground mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Education */}
          {profile.education && profile.education.length > 0 && (
            <Section title="Education" icon={<GraduationCap className="w-4 h-4" />}>
              <div className="space-y-3">
                {profile.education.map((edu, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm font-semibold text-foreground">{edu.title}</p>
                    <p className="text-xs text-muted-foreground">{edu.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{edu.period}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Achievements */}
          {profile.achievements && profile.achievements.filter(a => a.isFeatured).length > 0 && (
            <Section title="Achievements" icon={<Award className="w-4 h-4" />}>
              <div className="space-y-2">
                {profile.achievements.filter(a => a.isFeatured).map((a, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: accentColor }}
                    />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Languages */}
          {languageNames.length > 0 && (
            <Section title="Languages" icon={<Globe className="w-4 h-4" />}>
              <div className="flex flex-wrap gap-2">
                {languageNames.map((lang, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Sticky action buttons */}
        <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4 pb-safe">
          <div className="flex justify-center items-center gap-5">
            <Button
              variant="outline"
              size="lg"
              className="w-14 h-14 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => handleAction('left')}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-14 h-14 rounded-full border-2 border-accent text-accent-foreground hover:bg-accent"
              onClick={() => handleAction('nudge')}
            >
              <Zap className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-14 h-14 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => handleAction('right')}
            >
              <Heart className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h4 className="font-semibold text-foreground text-sm mb-2.5 flex items-center gap-2">
        {icon}
        {title}
      </h4>
      {children}
    </div>
  );
}
