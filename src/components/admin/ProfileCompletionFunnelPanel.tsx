import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ChevronUp, Mail, RefreshCw, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FunnelRow {
  user_id: string;
  email: string | null;
  signed_up_at: string | null;
  last_sign_in_at: string | null;
  score: number;
  is_complete: boolean;
  missing_count: number;
  nudge_sequence_step: number;
  last_nudge_sent_at: string | null;
  nudge_paused: boolean;
  user_type: string | null;
}

interface FunnelData {
  funnel: { total: number; complete: number; b_0_25: number; b_26_50: number; b_51_84: number };
  rows: FunnelRow[];
}

export function ProfileCompletionFunnelPanel() {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showComplete, setShowComplete] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['completion-funnel'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('admin-completion-funnel', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      return res.data as FunnelData;
    },
    staleTime: 60_000,
  });

  const sendNudges = useMutation({
    mutationFn: async (userIds: string[]) => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('process-profile-nudges', {
        body: { userIds },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: (data: any) => {
      const sent = (data?.results || []).filter((r: any) => r.status === 'sent').length;
      toast({ title: 'Nudges queued', description: `${sent} sent / ${data?.processed ?? 0} processed.` });
      setSelected(new Set());
      refetch();
    },
    onError: (err: any) => {
      toast({ title: 'Failed to send nudges', description: err.message, variant: 'destructive' });
    },
  });

  const rows = (data?.rows || []).filter(r => showComplete || !r.is_complete);

  const toggle = (id: string, on: boolean) => {
    const next = new Set(selected);
    on ? next.add(id) : next.delete(id);
    setSelected(next);
  };

  return (
    <div className="mb-6 rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[hsl(14_90%_60%)]" />
          <span className="text-sm font-semibold">Profile Completion Funnel</span>
          {data && (
            <span className="text-xs text-muted-foreground">
              · {data.funnel.total} users · {data.funnel.complete} complete
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border">
          {data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/20 border-b border-border text-xs">
              <Bucket label="0–25%" value={data.funnel.b_0_25} tone="hsl(0 80% 60%)" />
              <Bucket label="26–50%" value={data.funnel.b_26_50} tone="hsl(30 90% 55%)" />
              <Bucket label="51–84%" value={data.funnel.b_51_84} tone="hsl(45 95% 55%)" />
              <Bucket label="Complete (≥85%)" value={data.funnel.complete} tone="hsl(150 70% 45%)" />
            </div>
          )}

          <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-muted/10 border-b border-border">
            <label className="flex items-center gap-2 text-xs">
              <Checkbox checked={showComplete} onCheckedChange={(c) => setShowComplete(!!c)} />
              Show completed users
            </label>
            <Button
              size="sm"
              variant="default"
              className="h-7 text-xs bg-[hsl(14_90%_60%)] hover:bg-[hsl(14_90%_55%)] text-white"
              disabled={selected.size === 0 || sendNudges.isPending}
              onClick={() => sendNudges.mutate(Array.from(selected))}
            >
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              {sendNudges.isPending ? 'Sending…' : `Send next nudge (${selected.size})`}
            </Button>
          </div>

          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card border-b border-border">
                <tr>
                  <th className="px-3 py-2 w-8" />
                  <th className="px-3 py-2 text-left font-medium">Email</th>
                  <th className="px-3 py-2 text-left font-medium">Score</th>
                  <th className="px-3 py-2 text-left font-medium">Missing</th>
                  <th className="px-3 py-2 text-left font-medium">Signed up</th>
                  <th className="px-3 py-2 text-left font-medium">Nudge step</th>
                  <th className="px-3 py-2 text-left font-medium">Last nudge</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.user_id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-3 py-2">
                      <Checkbox
                        checked={selected.has(r.user_id)}
                        onCheckedChange={(c) => toggle(r.user_id, !!c)}
                        disabled={r.is_complete}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{r.email ?? '—'}</td>
                    <td className="px-3 py-2">
                      <Badge variant={r.is_complete ? 'default' : 'secondary'} className="text-[10px]">
                        {r.score}%
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{r.missing_count}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {r.signed_up_at ? formatDistanceToNow(new Date(r.signed_up_at), { addSuffix: true }) : '—'}
                    </td>
                    <td className="px-3 py-2">{r.nudge_sequence_step} / 5</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {r.last_nudge_sent_at ? formatDistanceToNow(new Date(r.last_nudge_sent_at), { addSuffix: true }) : <span className="italic opacity-60">never</span>}
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">No users to show.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2 text-[11px] text-muted-foreground border-t border-border">
            Automated nudge sequence runs every 30 min · 5 emails over 30 days · scores update in real time.
          </div>
        </div>
      )}
    </div>
  );
}

function Bucket({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg bg-background border border-border p-3">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: tone }} />
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}