
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
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Briefcase, Target, Brain, FileText, CheckCircle, Eye,
  TrendingUp, Star, Activity, Clock, User, Building2,
  ChevronDown, ChevronUp, Zap
} from 'lucide-react';

interface UserDrawerProps {
  userId: string;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

// Signal definitions for heatmap display
const SEEKER_SIGNALS = [
  { key: 'job_applied', label: 'Job Applied', icon: Briefcase, tier: 'high' },
  { key: 'resume_exported', label: 'CV Exported', icon: FileText, tier: 'high' },
  { key: 'profile_shared', label: 'Profile Shared', icon: Eye, tier: 'high' },
  { key: 'pitch_generated', label: 'Pitch Generated', icon: Star, tier: 'high' },
  { key: 'power_skill_reframed', label: 'Skill Reframed', icon: Brain, tier: 'medium' },
  { key: 'ai_mirror_used', label: 'AI Mirror', icon: Brain, tier: 'medium' },
  { key: 'goal_90day_created', label: '90-Day Goal', icon: Target, tier: 'medium' },
  { key: 'growth_prompt_completed', label: 'Growth Prompt', icon: TrendingUp, tier: 'medium' },
  { key: 'certification_completed', label: 'Certified', icon: CheckCircle, tier: 'medium' },
  { key: 'visible_to_employers_enabled', label: 'Went Visible', icon: Eye, tier: 'medium' },
  { key: 'dashboard_visited', label: 'Dashboard Visit', icon: Activity, tier: 'low' },
  { key: 'insight_opened', label: 'AI Insight', icon: Zap, tier: 'low' },
];

const EMPLOYER_SIGNALS = [
  { key: 'candidate_accepted', label: 'Accepted Candidate', icon: CheckCircle, tier: 'high' },
  { key: 'job_posted', label: 'Job Posted', icon: Briefcase, tier: 'medium' },
  { key: 'application_reviewed', label: 'App Reviewed', icon: FileText, tier: 'medium' },
  { key: 'candidate_rejected', label: 'Rejected Candidate', icon: Activity, tier: 'low' },
  { key: 'dashboard_visited', label: 'Dashboard Visit', icon: Activity, tier: 'low' },
];

const TIER_COLORS = {
  high: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  medium: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  low: 'bg-muted text-muted-foreground border-border',
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
                <Badge variant="outline" className="text-secondary-foreground border-border">
                  {isEmployer ? <Building2 className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                  {isEmployer ? 'Employer' : 'Seeker'}
                </Badge>
                {user.certified && (
                  <Badge variant="secondary">
                    ✓ Certified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              {userAnswers?.user_type && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">{userAnswers.user_type} · {userAnswers.career_path || '—'}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {effectiveColor && <ColorChip color={effectiveColor} />}
                {user.color_admin && (
                  <span className="text-xs text-muted-foreground">(admin override)</span>
                )}
              </div>
            </div>
          </div>

          {/* ── Quick Stats ─────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 text-center">
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
            <div className="rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{actionStats?.total || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Actions</div>
              <div className="text-xs mt-0.5 text-muted-foreground/60">all time</div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{profileScore}%</div>
              <div className="text-xs text-muted-foreground mt-1">Profile Score</div>
              <div className={`text-xs mt-0.5 font-medium ${profileScore >= 70 ? 'text-emerald-600' : profileScore >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                {profileScore >= 70 ? 'Strong' : profileScore >= 40 ? 'Partial' : 'Weak'}
              </div>
            </div>
          </div>

          {/* ── Signal Heatmap ──────────────────────────── */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Engagement Signals
            </h4>
            <div className="space-y-1.5">
              {signals.map(({ key, label, icon: Icon, tier }) => {
                const count = actionStats?.counts?.[key] || 0;
                const lastDate = actionStats?.lastDates?.[key];
                return (
                  <div key={key} className={`flex items-center justify-between py-1.5 px-2 rounded-md ${count > 0 ? 'bg-muted/50' : ''}`}>
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
                );
              })}
            </div>
          </div>

          {/* ── Profile Completion Breakdown ────────────── */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Profile Completion · {profileScore}%
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
                <div className="flex items-center gap-1.5 text-primary">
                  <span>✓</span>
                  <span>Visible to Employers</span>
                </div>
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
            <h4 className="font-semibold text-sm">Manual Override</h4>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Color (overrides auto)</Label>
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
                  <div key={value} className="flex items-center gap-1.5">
                    <RadioGroupItem value={value} id={`color-${value}`} />
                    <Label htmlFor={`color-${value}`} className="text-xs">{label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Intent Stage</Label>
              <RadioGroup
                value={selectedIntent}
                onValueChange={(v) => setSelectedIntent(v as IntentStage)}
                className="grid grid-cols-2 gap-1"
              >
                {Object.entries(INTENT_CONFIG).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <RadioGroupItem value={key} id={`intent-${key}`} />
                    <Label htmlFor={`intent-${key}`} className="text-xs">{config.label}</Label>
                  </div>
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
            <h4 className="font-semibold text-sm">Admin Notes</h4>
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
  );
}
