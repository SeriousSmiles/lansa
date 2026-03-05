import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSegmentStatistics } from '@/hooks/admin/useSegmentStatistics';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Mail, Users, Activity, AlertTriangle, Info } from 'lucide-react';
import { COLOR_CONFIG } from '@/utils/adminColors';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

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

export function SegmentStatisticsWidget() {
  const { data: stats, isLoading } = useSegmentStatistics(30);

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
                <InfoTooltip content="Emails sent when a user's engagement score dropped to the Drifting (red) segment. These are 'come back' nudge emails sent to inactive users. Previously mislabelled as 'Re-engagement'." />
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
                <InfoTooltip content="Users who were previously Drifting (red) and whose score moved back up to Underused, Engaged, or Advocate — triggering a positive re-engagement email. This is the key success metric for the nudge system." />
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.summary.recoveryEmails}</div>
              <p className="text-xs text-muted-foreground">Came back from drifting</p>
            </CardContent>
          </Card>
        </div>

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
                    Current snapshot of all users grouped by engagement segment. Uses color_auto (calculated by scoring engine) unless an admin has manually set color_admin to override it.
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="emails">Email Metrics</TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Daily count of automated nudge emails sent, grouped by the destination segment that triggered them. Each data point = a logged send event in segment_email_log within the last 30 days.
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="log">Email Log</TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    The 50 most recent automated emails sent — showing which user received it, what segment they moved from and to, and when it was sent.
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
                  <p className="text-xs text-muted-foreground/70">Transitions chart shows email send events — not raw user segment changes. One email = one send event in segment_email_log.</p>
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
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                          <Tooltip>
                            <TooltipTrigger asChild><span className="cursor-help border-b border-dashed border-muted-foreground/40">User</span></TooltipTrigger>
                            <TooltipContent className="text-xs">Name and email of the user who received this automated email</TooltipContent>
                          </Tooltip>
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                          <Tooltip>
                            <TooltipTrigger asChild><span className="cursor-help border-b border-dashed border-muted-foreground/40">From → To</span></TooltipTrigger>
                            <TooltipContent className="text-xs">The segment transition that triggered this email. "From" = their previous segment. "To" = their new segment after scoring.</TooltipContent>
                          </Tooltip>
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                          <Tooltip>
                            <TooltipTrigger asChild><span className="cursor-help border-b border-dashed border-muted-foreground/40">Email Type</span></TooltipTrigger>
                            <TooltipContent className="text-xs">The type of email sent: "drifting_alert" = nudge to come back, "recovery" = positive email for return, "engaged" = encouragement, "underused" = prompts to use more features</TooltipContent>
                          </Tooltip>
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                          <Tooltip>
                            <TooltipTrigger asChild><span className="cursor-help border-b border-dashed border-muted-foreground/40">Sent At</span></TooltipTrigger>
                            <TooltipContent className="text-xs">Timestamp when the email was dispatched via the Supabase Edge Function</TooltipContent>
                          </Tooltip>
                        </th>
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
                        const emailType = entry.new_segment === 'red'
                          ? 'Drifting Alert'
                          : (entry.old_segment === 'red' ? 'Recovery' : entry.new_segment === 'green' ? 'Engaged' : 'Underused');
                        const typeColors: Record<string, string> = {
                          'Drifting Alert': 'bg-red-50 text-red-700 border-red-200',
                          'Recovery': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          'Engaged': 'bg-green-50 text-green-700 border-green-200',
                          'Underused': 'bg-orange-50 text-orange-700 border-orange-200',
                        };
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
                              <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${typeColors[emailType] || 'bg-muted text-muted-foreground'}`}>
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
    </TooltipProvider>
  );
}
