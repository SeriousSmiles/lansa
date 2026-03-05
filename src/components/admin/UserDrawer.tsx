
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ColorChip } from './ColorChip';
import { getEffectiveColor, UserColor, IntentStage, INTENT_CONFIG } from '@/utils/adminColors';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Briefcase, Target, Brain, FileText, CheckCircle, Eye,
  TrendingUp, Star, Activity, Clock, User, Building2,
  ChevronDown, ChevronUp, Zap, Info
} from 'lucide-react';

interface UserDrawerProps {
  userId: string;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

// Signal definitions for heatmap display
const SEEKER_SIGNALS = [
  {
    key: 'job_applied', label: 'Job Applied', icon: Briefcase, tier: 'high',
    tooltip: 'Number of times this user applied to a job listing (job_applied action). Strongest intent signal — they are actively seeking work.'
  },
  {
    key: 'resume_exported', label: 'CV Exported', icon: FileText, tier: 'high',
    tooltip: 'Number of times this user exported their resume/CV (resume_exported action). Output creation — high-value signal.'
  },
  {
    key: 'profile_shared', label: 'Profile Shared', icon: Eye, tier: 'high',
    tooltip: 'Number of times this user shared their public profile link (profile_shared action). Indicates they are actively seeking visibility.'
  },
  {
    key: 'pitch_generated', label: 'Pitch Generated', icon: Star, tier: 'high',
    tooltip: 'Number of times this user generated a profile pitch using the AI pitch tool (pitch_generated action).'
  },
  {
    key: 'power_skill_reframed', label: 'Skill Reframed', icon: Brain, tier: 'medium',
    tooltip: 'Times the AI Skill Reframer was used — the user submitted a skill and received an employer-framed version (power_skill_reframed action). Logged via DB trigger on user_power_skills.'
  },
  {
    key: 'ai_mirror_used', label: 'AI Mirror', icon: Brain, tier: 'medium',
    tooltip: 'Times this user ran the AI Power Mirror review — generating a hire-signal score and manager-read summary (ai_mirror_used action). Logged via DB trigger on ai_mirror_reviews.'
  },
  {
    key: 'goal_90day_created', label: '90-Day Goal', icon: Target, tier: 'medium',
    tooltip: 'Number of 90-day goals created in the Goal Planner (goal_90day_created action). Logged via DB trigger on user_90day_goal.'
  },
  {
    key: 'growth_prompt_completed', label: 'Growth Prompt', icon: TrendingUp, tier: 'medium',
    tooltip: 'Number of Growth Hub prompts this user has marked as complete (growth_prompt_completed action). Logged via DB trigger on user_growth_progress.'
  },
  {
    key: 'certification_completed', label: 'Certified', icon: CheckCircle, tier: 'medium',
    tooltip: 'Whether this user has completed and passed the Lansa certification exam (certification_completed action).'
  },
  {
    key: 'visible_to_employers_enabled', label: 'Went Visible', icon: Eye, tier: 'medium',
    tooltip: 'Whether this user toggled their profile to be visible in the employer catalogue (visible_to_employers_enabled action). Indicates job-seeking intent.'
  },
  {
    key: 'dashboard_visited', label: 'Dashboard Visit', icon: Activity, tier: 'low',
    tooltip: 'Number of times this user loaded the main dashboard. Low-value signal — indicates app opens but not meaningful feature usage.'
  },
  {
    key: 'insight_opened', label: 'AI Insight', icon: Zap, tier: 'low',
    tooltip: 'Number of times this user opened an AI Coach insight card (insight_opened action).'
  },
];

const EMPLOYER_SIGNALS = [
  {
    key: 'candidate_accepted', label: 'Accepted Candidate', icon: CheckCircle, tier: 'high',
    tooltip: 'Number of job applicants this employer has accepted or moved forward (candidate_accepted action). Full-cycle completion — highest value employer signal.'
  },
  {
    key: 'job_posted', label: 'Job Posted', icon: Briefcase, tier: 'medium',
    tooltip: 'Number of job listings created by this employer (job_posted action). Core employer action.'
  },
  {
    key: 'application_reviewed', label: 'App Reviewed', icon: FileText, tier: 'medium',
    tooltip: 'Number of applications this employer has reviewed (application_reviewed action). Indicates active pipeline management.'
  },
  {
    key: 'candidate_rejected', label: 'Rejected Candidate', icon: Activity, tier: 'low',
    tooltip: 'Number of applicants this employer has rejected (candidate_rejected action). Low-value individually but signals active review behavior.'
  },
  {
    key: 'dashboard_visited', label: 'Dashboard Visit', icon: Activity, tier: 'low',
    tooltip: 'Number of times this employer loaded the dashboard. Low-value signal — app opens but not meaningful action.'
  },
];

const TIER_COLORS = {
  high: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  medium: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  low: 'bg-muted text-muted-foreground border-border',
};

const INTENT_TOOLTIPS: Record<string, string> = {
  none: 'No stage assigned. Default state.',
  exploring: 'User is exploring Lansa, browsing features, not yet committed to a specific goal.',
  building: 'User is actively building their profile, skills, and career positioning.',
  ready: 'User has completed key profile sections and is ready for employer visibility.',
  matched: 'User has been matched with or connected to an employer.',
  placed: 'User has been placed in a role — highest positive outcome.',
};

const COLOR_OVERRIDE_TOOLTIPS: Record<string, string> = {
  none: 'No override — the auto-calculated score (color_auto) will be used. This is the default.',
  purple: 'Override to Advocate. Use when a user is clearly high-value but their tracked actions are incomplete.',
  green: 'Override to Engaged. Use when a user is actively using Lansa but the score hasn\'t caught up.',
  orange: 'Override to Underused. Use when a user has potential but isn\'t using the right features.',
  red: 'Override to Drifting. Use when you want to trigger nudge emails or flag for manual follow-up.',
};

function SignalBadge({ count, tier }: { count: number; tier: string }) {
  if (count === 0) return (
    <span className="text-xs text-muted-foreground/50 font-mono">—</span>
  );
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${TIER_COLORS[tier as keyof typeof TIER_COLORS]}`}>
      {count}
    </span>
  );
}

function InfoTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3 w-3 text-muted-foreground/40 cursor-help shrink-0" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

export function UserDrawer({ userId, open, onClose, onUpdate }: UserDrawerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedColor, setSelectedColor] = useState<UserColor | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<IntentStage>('none');
  const [newNote, setNewNote] = useState('');
  const [showAllActions, setShowAllActions] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      setSelectedColor(data?.color_admin);
      setSelectedIntent(data?.intent || 'none');
      return data;
    },
    enabled: !!userId
  });

  const { data: userRole } = useQuery({
    queryKey: ['admin-user-role', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      return data?.map(r => r.role) || [];
    },
    enabled: !!userId
  });

  const { data: userAnswers } = useQuery({
    queryKey: ['admin-user-answers', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_answers')
        .select('user_type, career_path, identity')
        .eq('user_id', userId)
        .single();
      return data;
    },
    enabled: !!userId
  });

  const { data: actionStats } = useQuery({
    queryKey: ['admin-user-actions', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_actions')
        .select('action_type, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!data) return { counts: {}, lastDates: {}, recentActions: [] };

      const counts: Record<string, number> = {};
      const lastDates: Record<string, string> = {};

      data.forEach(a => {
        counts[a.action_type] = (counts[a.action_type] || 0) + 1;
        if (!lastDates[a.action_type]) lastDates[a.action_type] = a.created_at;
      });

      return {
        counts,
        lastDates,
        recentActions: data.slice(0, 20),
        total: data.length,
      };
    },
    enabled: !!userId
  });

  const { data: notes } = useQuery({
    queryKey: ['admin-notes', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!userId
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updates: { color_admin?: UserColor | null; intent?: IntentStage }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId);
      if (error) throw error;
      await supabase.rpc('log_admin_action', {
        p_action: 'update_user_attributes',
        p_target_user_id: userId,
        p_metadata: updates
      });
    },
    onSuccess: () => {
      toast({ title: 'User updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      onUpdate();
    },
    onError: (error) => {
      toast({ title: 'Error updating user', description: error.message, variant: 'destructive' });
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('admin_notes')
        .insert({ user_id: userId, author_id: authUser.id, note });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewNote('');
      toast({ title: 'Note added' });
      queryClient.invalidateQueries({ queryKey: ['admin-notes', userId] });
    }
  });

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-2xl">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!user) return null;

  const effectiveColor = getEffectiveColor(user.color_admin, user.color_auto);
  const isEmployer = userRole?.some(r => ['employer', 'business'].includes(r));
  const signals = isEmployer ? EMPLOYER_SIGNALS : SEEKER_SIGNALS;

  // Profile completion score
  const profileScore = [
    user.name ? 20 : 0,
    user.email ? 10 : 0,
    user.profile_image ? 15 : 0,
    user.about_text ? 15 : 0,
    user.title ? 10 : 0,
    (user.skills && Array.isArray(user.skills) && user.skills.length > 0) ? 15 : 0,
    (user.experiences && typeof user.experiences === 'object') ? 15 : 0,
  ].reduce((a, b) => a + b, 0);

  const daysSinceActive = user.last_active_at
    ? Math.floor((Date.now() - new Date(user.last_active_at).getTime()) / 86400000)
    : null;

  return (
    <TooltipProvider delayDuration={150}>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>User Signal Profile</SheetTitle>
          </SheetHeader>

          <div className="space-y-5 mt-5">
            {/* ── User Header ─────────────────────────────── */}
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarImage src={user.profile_image || undefined} />
                <AvatarFallback className="text-lg">
                  {user.name?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-semibold truncate">{user.name || 'Unnamed'}</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-secondary-foreground border-border cursor-help">
                        {isEmployer ? <Building2 className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                        {isEmployer ? 'Employer' : 'Seeker'}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      {isEmployer
                        ? 'This user has an employer/business role. Scoring uses employer-specific signals (job posting, candidate review).'
                        : 'This user is a job seeker. Scoring uses seeker signals (AI tools, applications, profile completion).'}
                    </TooltipContent>
                  </Tooltip>
                  {user.certified && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="cursor-help">✓ Certified</Badge>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">Passed the Lansa certification exam.</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                {userAnswers?.user_type && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{userAnswers.user_type} · {userAnswers.career_path || '—'}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {effectiveColor && <ColorChip color={effectiveColor} />}
                  {user.color_admin && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground cursor-help">(admin override)</span>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs max-w-xs">
                        An admin has manually set this user's segment. The auto-scoring engine will not change it until the override is cleared.
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>

            {/* ── Quick Stats ─────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-lg border p-3 text-center cursor-help">
                    <div className="text-2xl font-bold text-foreground">
                      {daysSinceActive !== null ? daysSinceActive : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Days Inactive</div>
                    {daysSinceActive !== null && (
                      <div className={`text-xs mt-0.5 font-medium ${daysSinceActive <= 7 ? 'text-emerald-600' : daysSinceActive <= 21 ? 'text-amber-600' : 'text-red-500'}`}>
                        {daysSinceActive <= 7 ? 'Active' : daysSinceActive <= 21 ? 'Fading' : 'Drifting'}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="text-xs max-w-xs">
                  Days since this user's last tracked action in user_actions or last chat message. "—" means no actions have ever been recorded. Drifting = 21+ days inactive (score is halved by the scoring engine).
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-lg border p-3 text-center cursor-help">
                    <div className="text-2xl font-bold text-foreground">{actionStats?.total || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">Total Actions</div>
                    <div className="text-xs mt-0.5 text-muted-foreground/60">all time</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="text-xs max-w-xs">
                  Total count of tracked actions across all time in user_actions. Includes dashboard visits, AI tool usage, job applications, and all other auto-tracked events.
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-lg border p-3 text-center cursor-help">
                    <div className="text-2xl font-bold text-foreground">{profileScore}%</div>
                    <div className="text-xs text-muted-foreground mt-1">Profile Score</div>
                    <div className={`text-xs mt-0.5 font-medium ${profileScore >= 70 ? 'text-emerald-600' : profileScore >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                      {profileScore >= 70 ? 'Strong' : profileScore >= 40 ? 'Partial' : 'Weak'}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="text-xs max-w-xs">
                  Weighted profile completion: Name (20%) + Email (10%) + Photo (15%) + About (15%) + Title (10%) + Skills (15%) + Experience (15%). Most users are at ~30% because they only have name + email.
                </TooltipContent>
              </Tooltip>
            </div>

            {/* ── Signal Heatmap ──────────────────────────── */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Engagement Signals
                <InfoTooltip content="Feature usage counts from user_actions, tracked automatically via DB triggers. High-value (green) = strongest scoring weight. Medium (blue) = moderate. Low (grey) = weak signal." />
              </h4>
              <div className="space-y-1.5">
                {signals.map(({ key, label, icon: Icon, tier, tooltip }) => {
                  const count = actionStats?.counts?.[key] || 0;
                  const lastDate = actionStats?.lastDates?.[key];
                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <div className={`flex items-center justify-between py-1.5 px-2 rounded-md cursor-help ${count > 0 ? 'bg-muted/50' : ''}`}>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${count > 0 ? 'text-foreground' : 'text-muted-foreground/40'}`} />
                            <span className={`text-xs ${count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground/60'}`}>
                              {label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {lastDate && count > 0 && (
                              <span className="text-xs text-muted-foreground/60">
                                {formatDistanceToNow(new Date(lastDate), { addSuffix: true })}
                              </span>
                            )}
                            <SignalBadge count={count} tier={tier} />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs leading-relaxed">
                        {tooltip}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* ── Profile Completion Breakdown ────────────── */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Profile Completion · {profileScore}%
                <InfoTooltip content="Breakdown of the profile completion score. Used as a secondary signal in the engagement scoring engine. Low completion penalizes the score but does NOT override high-value action signals." />
              </h4>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all bg-primary"
                  style={{ width: `${profileScore}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {[
                  { label: 'Name (20%)', done: !!user.name },
                  { label: 'Email (10%)', done: !!user.email },
                  { label: 'Photo (15%)', done: !!user.profile_image },
                  { label: 'About (15%)', done: !!user.about_text },
                  { label: 'Title (10%)', done: !!user.title },
                  { label: 'Skills (15%)', done: Array.isArray(user.skills) && user.skills.length > 0 },
                  { label: 'Experience (15%)', done: !!(user.experiences && typeof user.experiences === 'object') },
                ].map(({ label, done }) => (
                  <div key={label} className={`flex items-center gap-1.5 ${done ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                    <span>{done ? '✓' : '○'}</span>
                    <span>{label}</span>
                  </div>
                ))}
                {user.visible_to_employers && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 text-primary cursor-help">
                        <span>✓</span>
                        <span>Visible to Employers</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      This user is opted in to the employer catalogue — recruiters can see their profile.
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* ── Recent Actions ──────────────────────────── */}
            {actionStats && actionStats.recentActions.length > 0 && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Recent Actions
                    <InfoTooltip content="Raw event log from user_actions — the last 20 tracked events. Shows exact action types and timestamps. All entries are auto-inserted by DB triggers or explicit tracking calls." />
                  </h4>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowAllActions(v => !v)}>
                    {showAllActions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showAllActions ? 'Less' : 'More'}
                  </Button>
                </div>
                <div className="space-y-1">
                  {(showAllActions ? actionStats.recentActions : actionStats.recentActions.slice(0, 5)).map((action, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0">
                      <span className="font-mono text-muted-foreground">{action.action_type}</span>
                      <span className="text-muted-foreground/60 shrink-0 ml-2">
                        {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Manual Controls ─────────────────────────── */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                Manual Override
                <InfoTooltip content="Admin color overrides take precedence over the auto-calculated color_auto score and will NOT be changed by the scoring engine. Use sparingly — overrides can mask real data. Clear the override (set to None) to let the engine score normally." />
              </h4>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  Color override
                  <InfoTooltip content="Sets color_admin on the user's profile. This overrides color_auto until cleared. Useful when auto-scoring is inaccurate due to missing tracking coverage." />
                </Label>
                <RadioGroup
                  value={selectedColor || 'none'}
                  onValueChange={(v) => setSelectedColor(v === 'none' ? null : v as UserColor)}
                  className="grid grid-cols-2 gap-1"
                >
                  {[
                    { value: 'none', label: 'None (Auto)' },
                    { value: 'purple', label: '🟣 Advocate' },
                    { value: 'green', label: '🟢 Engaged' },
                    { value: 'orange', label: '🟠 Underused' },
                    { value: 'red', label: '🔴 Drifting' },
                  ].map(({ value, label }) => (
                    <Tooltip key={value}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-help">
                          <RadioGroupItem value={value} id={`color-${value}`} />
                          <Label htmlFor={`color-${value}`} className="text-xs cursor-pointer">{label}</Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs max-w-xs">
                        {COLOR_OVERRIDE_TOOLTIPS[value]}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  Intent Stage
                  <InfoTooltip content="Admin-assigned journey stage. This is a manual label for your tracking purposes — it does NOT affect scoring or emails. Use it to track where a user is in their Lansa journey." />
                </Label>
                <RadioGroup
                  value={selectedIntent}
                  onValueChange={(v) => setSelectedIntent(v as IntentStage)}
                  className="grid grid-cols-2 gap-1"
                >
                  {Object.entries(INTENT_CONFIG).map(([key, config]) => (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-help">
                          <RadioGroupItem value={key} id={`intent-${key}`} />
                          <Label htmlFor={`intent-${key}`} className="text-xs cursor-pointer">{config.label}</Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs max-w-xs">
                        {INTENT_TOOLTIPS[key] || config.label}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </RadioGroup>
              </div>

              <Button
                onClick={() => updateUserMutation.mutate({ color_admin: selectedColor, intent: selectedIntent })}
                disabled={updateUserMutation.isPending}
                size="sm"
                className="w-full"
              >
                Save Override
              </Button>
            </div>

            {/* ── Admin Notes ─────────────────────────────── */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                Admin Notes
                <InfoTooltip content="Private notes visible only to admins. Use for context, observations, or action items about this user. Notes are timestamped and tied to the admin who wrote them." />
              </h4>
              <div className="space-y-2">
                <Textarea
                  placeholder="Add observation, context, or action note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
                <Button
                  onClick={() => addNoteMutation.mutate(newNote)}
                  disabled={!newNote.trim() || addNoteMutation.isPending}
                  size="sm"
                >
                  Add Note
                </Button>
              </div>
              <div className="space-y-2">
                {notes?.map((note) => (
                  <div key={note.id} className="bg-muted/60 p-3 rounded-lg text-sm border border-border/40">
                    <p className="text-foreground">{note.note}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
                {(!notes || notes.length === 0) && (
                  <p className="text-xs text-muted-foreground/60 italic">No notes yet</p>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
