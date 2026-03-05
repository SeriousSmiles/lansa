import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useSegmentStatistics } from '@/hooks/admin/useSegmentStatistics';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Mail, Users, Activity, AlertTriangle, Info, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { COLOR_CONFIG } from '@/utils/adminColors';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SEGMENT_COLORS = {
  purple: '#9333ea',
  green: '#10b981',
  orange: '#f59e0b',
  red: '#ef4444'
};

const SEGMENT_TOOLTIPS = {
  purple: 'Advocate — Consistently uses Lansa for its core purpose, creates outputs, and returns regularly. Highest-value user.',
  green: 'Engaged — Actively using 2–3+ key features in the last 30 days.',
  orange: 'Underused — Completed onboarding and has done some things, but stuck on 1 feature or infrequent.',
  red: 'Drifting — Opened the app but hasn\'t done anything meaningful in 21+ days, or onboarded but never came back.',
};

function InfoTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help shrink-0" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

function segmentLabel(seg: string | null): string {
  if (!seg) return '—';
  const map: Record<string, string> = { purple: 'Advocate', green: 'Engaged', orange: 'Underused', red: 'Drifting' };
  return map[seg] || seg;
}

function SegmentBadge({ segment }: { segment: string | null }) {
  if (!segment) return <span className="text-muted-foreground text-xs">—</span>;
  const colors: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${colors[segment] || 'bg-muted text-muted-foreground border-border'}`}>
      {segmentLabel(segment)}
    </span>
  );
}

interface BroadcastResult {
  sent: number;
  skipped_rate_limited: number;
  skipped_no_email: number;
}

export function SegmentStatisticsWidget() {
  const { data: stats, isLoading } = useSegmentStatistics(30);
  const { toast } = useToast();
  const [showBroadcastConfirm, setShowBroadcastConfirm] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<BroadcastResult | null>(null);

  const handleBroadcast = async () => {
    setShowBroadcastConfirm(false);
    setIsBroadcasting(true);
    setBroadcastResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('broadcast-segment-emails', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      const result = data as BroadcastResult;
      setBroadcastResult(result);
      toast({
        title: `Broadcast complete`,
        description: `${result.sent} emails sent, ${result.skipped_rate_limited} rate-limited, ${result.skipped_no_email} skipped`,
      });
    } catch (err: any) {
      console.error('[broadcast]', err);
      toast({
        title: 'Broadcast failed',
        description: err.message || 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Segment Analytics
          </CardTitle>
          <CardDescription>Loading statistics...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!stats) return null;

  const distributionData = [
    { name: 'Advocate', value: stats.distribution.purple, color: SEGMENT_COLORS.purple },
    { name: 'Engaged', value: stats.distribution.green, color: SEGMENT_COLORS.green },
    { name: 'Underused', value: stats.distribution.orange, color: SEGMENT_COLORS.orange },
    { name: 'Drifting', value: stats.distribution.red, color: SEGMENT_COLORS.red }
  ].filter(d => d.value > 0);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <InfoTooltip content="Total number of users with a completed profile in user_profiles. Note: auth.users may show a higher count — users who signed up but never finished onboarding are not included here." />
              </div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.distribution.total}</div>
              <p className="text-xs text-muted-foreground">With completed profiles</p>
            </CardContent>
          </Card>

          {/* Emails Sent */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                <InfoTooltip content="Total automated nudge emails sent all-time via the segment change system. Each entry in segment_email_log represents one email dispatched when a user's engagement score changed segment." />
              </div>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.totalEmailsSent}</div>
              <p className="text-xs text-muted-foreground">All-time automated sends</p>
            </CardContent>
          </Card>

          {/* Drifting Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium">Drifting Alerts</CardTitle>
                <InfoTooltip content="Emails sent when a user's engagement score dropped to the Drifting (red) segment. These are 'come back' nudge emails sent to inactive users." />
              </div>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.summary.driftingAlertEmails}</div>
              <p className="text-xs text-muted-foreground">Users who went drifting</p>
            </CardContent>
          </Card>

          {/* Recoveries */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium">Recoveries</CardTitle>
                <InfoTooltip content="Users who were previously Drifting (red) and whose score moved back up to Underused, Engaged, or Advocate — triggering a positive re-engagement email." />
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.summary.recoveryEmails}</div>
              <p className="text-xs text-muted-foreground">Came back from drifting</p>
            </CardContent>
          </Card>
        </div>

        {/* Broadcast Panel */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Send className="h-4 w-4 text-primary" />
              Broadcast Segment Emails
            </CardTitle>
            <CardDescription>
              Send a personalised email to every user based on their current segment — nudging them toward the next tier. Respects a 5-day rate limit per user.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button
                onClick={() => setShowBroadcastConfirm(true)}
                disabled={isBroadcasting}
                className="gap-2"
              >
                {isBroadcasting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Sending…</>
                ) : (
                  <><Send className="h-4 w-4" />Send Segment Emails to All Users</>
                )}
              </Button>

              {broadcastResult && (
                <div className="flex items-center gap-3 text-sm bg-background border rounded-lg px-4 py-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-emerald-700">{broadcastResult.sent} sent</span>
                    <span className="text-muted-foreground mx-1.5">·</span>
                    <span className="text-muted-foreground">{broadcastResult.skipped_rate_limited} rate-limited</span>
                    <span className="text-muted-foreground mx-1.5">·</span>
                    <span className="text-muted-foreground">{broadcastResult.skipped_no_email} skipped</span>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { color: 'bg-red-400', label: 'Drifting', desc: '"Come back" nudge' },
                { color: 'bg-orange-400', label: 'Underused', desc: 'Next feature suggestion' },
                { color: 'bg-green-500', label: 'Engaged', desc: '"Keep going" push' },
                { color: 'bg-purple-500', label: 'Advocate', desc: 'Recognition email ⭐' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${item.color} mt-0.5 shrink-0`} />
                  <div>
                    <div className="font-medium text-foreground">{item.label}</div>
                    <div className="text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Segment Analytics
            </CardTitle>
            <CardDescription>
              User distribution and email campaign performance over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="distribution" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="distribution">Distribution</TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Current snapshot of all users grouped by engagement segment.
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="emails">Email Metrics</TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Daily count of automated nudge emails sent, grouped by destination segment.
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="log">Email Log</TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    The 50 most recent automated emails sent.
                  </TooltipContent>
                </Tooltip>
              </TabsList>

              {/* Distribution Tab */}
              <TabsContent value="distribution" className="space-y-4">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {Object.entries(COLOR_CONFIG).map(([key, config]) => {
                    const count = stats.distribution[key as keyof typeof stats.distribution];
                    const percentage = stats.distribution.total > 0
                      ? ((count / stats.distribution.total) * 100).toFixed(1)
                      : '0';
                    return (
                      <Tooltip key={key}>
                        <TooltipTrigger asChild>
                          <div className={`p-4 rounded-lg border ${config.borderClass} ${config.bgClass} cursor-help`}>
                            <div className="flex items-center justify-between">
                              <span className={`font-medium ${config.textClass}`}>{config.label}</span>
                              <span className={`text-2xl font-bold ${config.textClass}`}>{count}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{percentage}% of users</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">
                          {SEGMENT_TOOLTIPS[key as keyof typeof SEGMENT_TOOLTIPS]}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Email Metrics Tab */}
              <TabsContent value="emails" className="space-y-4">
                {stats.emailMetrics.length === 0 ? (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground text-sm">
                    No email activity in the last 30 days
                  </div>
                ) : (
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.emailMetrics}
                        margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="to_red" stackId="a" fill={SEGMENT_COLORS.red} name="→ Drifting Alert" />
                        <Bar dataKey="to_orange" stackId="a" fill={SEGMENT_COLORS.orange} name="→ Underused" />
                        <Bar dataKey="to_green" stackId="a" fill={SEGMENT_COLORS.green} name="→ Engaged" />
                        <Bar dataKey="from_red" stackId="a" fill="#6366f1" name="Recovery ↑" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="text-sm text-muted-foreground space-y-1 border rounded-lg p-3 bg-muted/30">
                  <p>📊 Each bar = emails sent on that day, stacked by which segment the user moved <strong>into</strong>.</p>
                  <p>📧 <strong>{stats.summary.averageEmailsPerDay.toFixed(1)}</strong> avg emails/day in the last 30 days</p>
                  <p className="text-xs text-muted-foreground/70">Transitions chart shows email send events — not raw user segment changes.</p>
                </div>
              </TabsContent>

              {/* Email Log Tab */}
              <TabsContent value="log" className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground border rounded-lg p-3 bg-muted/30">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>Last {stats.emailLogEntries.length} automated emails sent by the segment scoring engine.</span>
                </div>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">User</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">From → To</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Email Type</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Sent At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.emailLogEntries.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                            No emails logged yet
                          </td>
                        </tr>
                      )}
                      {stats.emailLogEntries.map((entry) => {
                        const isBroadcast = entry.old_segment === entry.new_segment;
                        const emailType = isBroadcast
                          ? `Broadcast (${segmentLabel(entry.new_segment)})`
                          : entry.new_segment === 'red'
                            ? 'Drifting Alert'
                            : (entry.old_segment === 'red' ? 'Recovery' : entry.new_segment === 'green' ? 'Engaged' : entry.new_segment === 'purple' ? 'Advocate ⭐' : 'Underused');
                        const typeColors: Record<string, string> = {
                          'Drifting Alert': 'bg-red-50 text-red-700 border-red-200',
                          'Recovery': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          'Engaged': 'bg-green-50 text-green-700 border-green-200',
                          'Underused': 'bg-orange-50 text-orange-700 border-orange-200',
                          'Advocate ⭐': 'bg-purple-50 text-purple-700 border-purple-200',
                        };
                        const broadcastColor = 'bg-blue-50 text-blue-700 border-blue-200';
                        return (
                          <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-3 py-2.5">
                              <div className="font-medium text-foreground">{entry.user_name || 'Unknown'}</div>
                              <div className="text-muted-foreground/70">{entry.user_email || entry.user_id.slice(0, 8) + '…'}</div>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <SegmentBadge segment={entry.old_segment} />
                                <span className="text-muted-foreground">→</span>
                                <SegmentBadge segment={entry.new_segment} />
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${isBroadcast ? broadcastColor : (typeColors[emailType] || 'bg-muted text-muted-foreground')}`}>
                                {emailType}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                              {format(new Date(entry.email_sent_at), 'MMM d, HH:mm')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Broadcast Confirmation Dialog */}
      <AlertDialog open={showBroadcastConfirm} onOpenChange={setShowBroadcastConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Segment Emails to All Users?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                This will send a personalised email to every user based on their current segment:
              </span>
              <span className="block text-sm space-y-1 mt-2">
                <span className="block">🔴 <strong>Drifting</strong> → "Come back" nudge</span>
                <span className="block">🟠 <strong>Underused</strong> → Next feature suggestion</span>
                <span className="block">🟢 <strong>Engaged</strong> → "You're on fire" push</span>
                <span className="block">🟣 <strong>Advocate</strong> → Recognition email ⭐</span>
              </span>
              <span className="block mt-2 text-xs text-muted-foreground">
                Users who received any segment email in the last 5 days will be skipped. This cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBroadcast} className="gap-2">
              <Send className="h-4 w-4" />
              Send Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
