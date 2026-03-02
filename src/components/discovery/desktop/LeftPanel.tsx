import { useState, useEffect } from 'react';
import { DiscoveryProfile } from '@/services/discoveryService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Award, Loader2, Sparkles, CheckCircle2, BookOpen, Globe, Target, Zap } from 'lucide-react';
import { matchSummaryService } from '@/services/matchSummaryService';
import { useAuth } from '@/contexts/AuthContext';

function hexToRgb(hex: string): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '100,100,100';
  return `${r},${g},${b}`;
}

interface LeftPanelProps {
  profile: DiscoveryProfile;
}

export function LeftPanel({ profile }: LeftPanelProps) {
  const { user } = useAuth();
  const [matchSummary, setMatchSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    if (user?.id && profile?.user_id) {
      setMatchSummary('');
      setIsLoadingSummary(true);
      matchSummaryService.getMatchSummary(user.id, profile)
        .then(summary => setMatchSummary(summary))
        .catch(() => {
          setMatchSummary(
            profile.about_text?.slice(0, 150) +
            (profile.about_text && profile.about_text.length > 150 ? '...' : '') ||
            'No summary available'
          );
        })
        .finally(() => setIsLoadingSummary(false));
    }
  }, [user?.id, profile?.user_id]);

  if (!profile) return null;

  const topSkills = profile.skills?.slice(0, 6) || [];
  const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  const coverColor = profile.cover_color || null;
  const accentColor = profile.highlight_color || '#6366f1';
  const rgb = hexToRgb(accentColor);
  const languages = profile.languages || [];
  const achievements = profile.achievements || [];

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto">

      {/* Cover Banner */}
      <div
        className="relative h-[88px] shrink-0"
        style={{
          background: coverColor
            ? coverColor
            : 'linear-gradient(135deg, hsl(var(--primary)/0.15) 0%, hsl(var(--primary)/0.05) 100%)'
        }}
      />

      {/* Identity block — avatar overlapping banner */}
      <div className="relative px-5 pb-4">
        <div className="absolute -top-9 left-5">
          <div className="relative">
            <Avatar className="w-[72px] h-[72px] ring-[3px] ring-background shadow-md">
              <AvatarImage src={profile.profile_image || undefined} alt={profile.name || ''} />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            {profile.isCertified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                <Award className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
        </div>

        <div className="pt-12">
          <h2 className="text-lg font-bold text-foreground leading-tight">
            {profile.name || 'Anonymous'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profile.title || 'Professional'}
          </p>
          {profile.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mx-5" />

      {/* Skills */}
      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
          Top Skills
        </p>
        {topSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {topSkills.map((skill, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5 font-medium rounded-md">
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No skills listed</p>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border mx-5" />

      {/* AI Match Summary tile */}
      <div className="px-5 py-4">
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">
              Why This Match
            </p>
          </div>
          {isLoadingSummary ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analysing compatibility…</span>
            </div>
          ) : (
            <p className="text-xs text-foreground/75 leading-relaxed">
              {matchSummary || 'No match summary available.'}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mx-5" />

      {/* About */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-1.5 mb-2">
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">About</p>
        </div>
        {profile.about_text ? (
          <p className="text-xs text-foreground/80 leading-relaxed">{profile.about_text}</p>
        ) : (
          <p className="text-xs text-muted-foreground italic">No bio provided yet.</p>
        )}
      </div>

      {/* Languages */}
      {languages.length > 0 && (
        <>
          <div className="h-px bg-border mx-5" />
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Languages</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">{lang}</Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <>
          <div className="h-px bg-border mx-5" />
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Award className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Achievements</p>
            </div>
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
          </div>
        </>
      )}

      {/* Professional Goals */}
      {profile.professional_goal && (
        <>
          <div className="h-px bg-border mx-5" />
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Professional Goals</p>
            </div>
            <div className="border-l-[3px] pl-3" style={{ borderColor: accentColor }}>
              <p className="text-xs text-foreground/80 leading-relaxed italic">{profile.professional_goal}</p>
            </div>
          </div>
        </>
      )}

      {/* Biggest Challenge */}
      {profile.biggest_challenge && (
        <>
          <div className="h-px bg-border mx-5" />
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Biggest Challenge</p>
            </div>
            <div className="border-l-[3px] pl-3" style={{ borderColor: `rgba(${rgb}, 0.5)` }}>
              <p className="text-xs text-foreground/80 leading-relaxed italic">{profile.biggest_challenge}</p>
            </div>
          </div>
        </>
      )}

      {/* Certified tile */}
      {profile.isCertified && (
        <>
          <div className="h-px bg-border mx-5" />
          <div className="px-5 py-4">
            <div className="flex items-center gap-2.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-green-700 dark:text-green-400">Lansa Certified</p>
                <p className="text-[10px] text-green-600/70 dark:text-green-500/70">Verified professional</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
