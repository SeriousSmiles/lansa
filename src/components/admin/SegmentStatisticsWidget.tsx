import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSegmentStatistics } from '@/hooks/admin/useSegmentStatistics';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Mail, Users, Activity } from 'lucide-react';
import { COLOR_CONFIG } from '@/utils/adminColors';

const SEGMENT_COLORS = {
  purple: '#9333ea',
  green: '#10b981',
  orange: '#f59e0b',
  red: '#ef4444'
};

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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.distribution.total}</div>
            <p className="text-xs text-muted-foreground">
              Across all segments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.totalEmailsSent}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Re-engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.reEngagementEmails}</div>
            <p className="text-xs text-muted-foreground">
              To drifting users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recoveries</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.recoveryEmails}</div>
            <p className="text-xs text-muted-foreground">
              From drifting
            </p>
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
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="emails">Email Metrics</TabsTrigger>
              <TabsTrigger value="transitions">Transitions</TabsTrigger>
            </TabsList>

            <TabsContent value="distribution" className="space-y-4">
              <div className="h-[400px] w-full">
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
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                {Object.entries(COLOR_CONFIG).map(([key, config]) => {
                  const count = stats.distribution[key as keyof typeof stats.distribution];
                  const percentage = stats.distribution.total > 0 
                    ? ((count / stats.distribution.total) * 100).toFixed(1)
                    : '0';
                  return (
                    <div key={key} className={`p-4 rounded-lg border ${config.borderClass} ${config.bgClass}`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${config.textClass}`}>{config.label}</span>
                        <span className={`text-2xl font-bold ${config.textClass}`}>{count}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{percentage}% of users</p>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="emails" className="space-y-4">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.emailMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total_sent" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Total Sent"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="to_red" 
                      stroke={SEGMENT_COLORS.red} 
                      strokeWidth={2}
                      name="To Drifting"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="to_orange" 
                      stroke={SEGMENT_COLORS.orange} 
                      strokeWidth={2}
                      name="To Underused"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="from_red" 
                      stroke={SEGMENT_COLORS.green} 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Recoveries"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>📧 <strong>{stats.summary.averageEmailsPerDay.toFixed(1)}</strong> emails sent per day on average</p>
                <p className="mt-2">Recoveries shown as dashed line represent users who moved from Drifting to other segments.</p>
              </div>
            </TabsContent>

            <TabsContent value="transitions" className="space-y-4">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={stats.emailMetrics}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="to_red" stackId="a" fill={SEGMENT_COLORS.red} name="→ Drifting" />
                    <Bar dataKey="to_orange" stackId="a" fill={SEGMENT_COLORS.orange} name="→ Underused" />
                    <Bar dataKey="to_green" stackId="a" fill={SEGMENT_COLORS.green} name="→ Engaged" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Stacked bars show the direction of segment transitions that triggered automated emails.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
