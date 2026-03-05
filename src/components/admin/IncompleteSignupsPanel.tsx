import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Mail, UserX, ChevronDown, ChevronUp, Info, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface IncompleteUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  provider: string;
}

function InfoTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3 w-3 text-muted-foreground/50 cursor-help shrink-0" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">{content}</TooltipContent>
    </Tooltip>
  );
}

export function IncompleteSignupsPanel() {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading, refetch, isError } = useQuery({
    queryKey: ['incomplete-signups'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('get-incomplete-signups', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      return res.data as { incomplete: IncompleteUser[]; total_auth: number; total_profiles: number };
    },
    staleTime: 1000 * 60 * 5,
  });

  const sendNudgeMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('send-onboarding-nudge', {
        body: { userIds },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      return res.data as { sent: number; total: number };
    },
    onSuccess: (data) => {
      toast({ title: `✅ Nudge emails sent`, description: `${data.sent} of ${data.total} emails dispatched successfully.` });
      setSelected(new Set());
    },
    onError: (err: any) => {
      toast({ title: 'Failed to send emails', description: err.message, variant: 'destructive' });
    },
  });

  const users = data?.incomplete || [];
  const count = users.length;

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(users.map(u => u.id)) : new Set());
  };
  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selected);
    checked ? next.add(id) : next.delete(id);
    setSelected(next);
  };

  if (isError || (!isLoading && count === 0)) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <UserX className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Incomplete Sign-ups
            </span>
            {!isLoading && (
              <Badge className="bg-amber-200 text-amber-800 border-0 dark:bg-amber-800 dark:text-amber-200 text-xs px-1.5 py-0.5">
                {count}
              </Badge>
            )}
            <InfoTooltip content="These users created an auth account (visible in Supabase auth.users) but never finished onboarding — so no user_profiles row exists for them. They are invisible to all scoring, tracking, and email systems. Send them a nudge to complete their profile." />
          </div>
          <div className="flex items-center gap-2">
            {isLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />}
            {expanded ? <ChevronUp className="h-4 w-4 text-amber-600" /> : <ChevronDown className="h-4 w-4 text-amber-600" />}
          </div>
        </button>

        {/* Expanded Content */}
        {expanded && (
          <div className="border-t border-amber-200 dark:border-amber-800">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-amber-100/60 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selected.size === users.length && users.length > 0}
                  onCheckedChange={(c) => toggleAll(!!c)}
                />
                <span className="text-xs text-amber-700 dark:text-amber-400">
                  {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
                </span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-amber-400 text-amber-800 hover:bg-amber-200 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/40"
                    disabled={selected.size === 0 || sendNudgeMutation.isPending}
                    onClick={() => sendNudgeMutation.mutate(Array.from(selected))}
                  >
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    {sendNudgeMutation.isPending ? 'Sending…' : `Send Nudge Email${selected.size > 1 ? 's' : ''}`}
                    {selected.size > 0 && ` (${selected.size})`}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Sends a branded email to selected users with a summary of what Lansa offers and a direct link to complete their onboarding. Uses Resend via the send-onboarding-nudge edge function.
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30">
                    <th className="px-4 py-2 w-8" />
                    <th className="px-4 py-2 text-left font-medium text-amber-700 dark:text-amber-400">
                      <Tooltip>
                        <TooltipTrigger asChild><span className="cursor-help border-b border-dashed border-amber-400/50">Email</span></TooltipTrigger>
                        <TooltipContent className="text-xs">The email address from auth.users — this is the only data we have for these users.</TooltipContent>
                      </Tooltip>
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-amber-700 dark:text-amber-400 hidden sm:table-cell">
                      <Tooltip>
                        <TooltipTrigger asChild><span className="cursor-help border-b border-dashed border-amber-400/50">Signed up</span></TooltipTrigger>
                        <TooltipContent className="text-xs">When this user created their auth account (auth.users.created_at). They never completed onboarding after this.</TooltipContent>
                      </Tooltip>
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-amber-700 dark:text-amber-400 hidden md:table-cell">
                      <Tooltip>
                        <TooltipTrigger asChild><span className="cursor-help border-b border-dashed border-amber-400/50">Last login</span></TooltipTrigger>
                        <TooltipContent className="text-xs">Most recent sign-in attempt (auth.users.last_sign_in_at). Null = they never signed in after creating the account.</TooltipContent>
                      </Tooltip>
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-amber-700 dark:text-amber-400 hidden md:table-cell">
                      <Tooltip>
                        <TooltipTrigger asChild><span className="cursor-help border-b border-dashed border-amber-400/50">Provider</span></TooltipTrigger>
                        <TooltipContent className="text-xs">How they signed up — email/password or OAuth provider (Google, etc.).</TooltipContent>
                      </Tooltip>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-amber-100 dark:border-amber-900/40 last:border-0 hover:bg-amber-100/40 dark:hover:bg-amber-900/20 transition-colors">
                      <td className="px-4 py-2.5">
                        <Checkbox
                          checked={selected.has(user.id)}
                          onCheckedChange={(c) => toggleOne(user.id, !!c)}
                        />
                      </td>
                      <td className="px-4 py-2.5 font-medium text-foreground">{user.email}</td>
                      <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">
                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">
                        {user.last_sign_in_at
                          ? formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true })
                          : <span className="text-muted-foreground/50 italic">never</span>}
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        <span className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground capitalize">{user.provider}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-2.5 text-xs text-amber-700/70 dark:text-amber-500/70 border-t border-amber-200 dark:border-amber-800">
              Sourced from auth.users via the <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">get-incomplete-signups</code> edge function (requires service role).
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
