import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useMentorProfile, type MentorProfile } from "@/hooks/useMentorProfile";
import { useMentorSubscription, TIER_CONFIG } from "@/hooks/useMentorSubscription";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Video,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Crown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";

const CHART_COLORS = {
  coral: "#FF6B4A",
  navy: "#1A1F71",
  teal: "#2DD4BF",
  amber: "#F59E0B",
  muted: "#94A3B8",
};

function useContentVideos(userId?: string) {
  return useQuery({
    queryKey: ["mentor-videos-stats", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("content_videos")
        .select("id, title, is_published, is_promoted, category, created_at")
        .eq("mentor_id", userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

function ApprovalStatusCard({ profile }: { profile: MentorProfile | null | undefined }) {
  const status = profile?.approval_status || "pending";
  const config = {
    pending: {
      icon: Clock,
      label: "Pending Review",
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      description: "Your profile is being reviewed by our team.",
    },
    approved: {
      icon: CheckCircle2,
      label: "Approved",
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
      description: "You're verified and can publish content.",
    },
    rejected: {
      icon: XCircle,
      label: "Needs Changes",
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
      description: profile?.rejected_reason || "Please update your profile.",
    },
  }[status];

  const Icon = config.icon;

  return (
    <Card className={`border ${config.bg}`}>
      <CardContent className="pt-5 pb-4 flex items-start gap-3">
        <div className={`p-2 rounded-full ${config.bg}`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${config.color}`}>{config.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {config.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className="text-xl font-bold tracking-tight mt-0.5">{value}</p>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MentorOverviewSection() {
  const { user } = useAuth();
  const { data: profile } = useMentorProfile();
  const { data: subscription } = useMentorSubscription();
  const { data: videos = [] } = useContentVideos(user?.id);

  const tier = subscription?.tier || "free";
  const tierConfig = TIER_CONFIG[tier];
  const totalVideos = videos.length;
  const publishedVideos = videos.filter((v) => v.is_published).length;
  const promotedVideos = videos.filter((v) => v.is_promoted).length;
  const maxVideos = tierConfig.maxVideos === Infinity ? "∞" : tierConfig.maxVideos;

  // Build "videos over time" chart data (last 30 days)
  const videosOverTime = useMemo(() => {
    const days = 30;
    const buckets: { date: string; videos: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, "yyyy-MM-dd");
      const count = videos.filter(
        (v) => format(new Date(v.created_at), "yyyy-MM-dd") <= dateStr
      ).length;
      buckets.push({ date: format(d, "MMM d"), videos: count });
    }
    return buckets;
  }, [videos]);

  // Category distribution for pie chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    videos.forEach((v) => {
      const cat = v.category || "Uncategorized";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [videos]);

  const pieColors = [
    CHART_COLORS.coral,
    CHART_COLORS.navy,
    CHART_COLORS.teal,
    CHART_COLORS.amber,
    CHART_COLORS.muted,
  ];

  return (
    <div className="space-y-5">
      {/* Row 1: Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Video}
          label="Total Videos"
          value={totalVideos}
          subtitle={`${publishedVideos} published · max ${maxVideos}`}
          color={CHART_COLORS.coral}
        />
        <StatCard
          icon={Eye}
          label="Published"
          value={publishedVideos}
          subtitle={totalVideos > 0 ? `${Math.round((publishedVideos / totalVideos) * 100)}% of content` : "No content yet"}
          color={CHART_COLORS.navy}
        />
        <StatCard
          icon={TrendingUp}
          label="Promoted"
          value={promotedVideos}
          subtitle={tierConfig.promoted ? "Promotion active" : "Upgrade to promote"}
          color={CHART_COLORS.teal}
        />
        <StatCard
          icon={Crown}
          label="Current Plan"
          value={tierConfig.label}
          subtitle={tierConfig.price === 0 ? "Free tier" : `XCG ${tierConfig.price}/mo`}
          color={CHART_COLORS.amber}
        />
      </div>

      {/* Row 2: Approval status */}
      <ApprovalStatusCard profile={profile} />

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Content growth chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Content Growth (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={videosOverTime}>
                  <defs>
                    <linearGradient id="mentorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.coral} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.coral} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#94A3B8" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#94A3B8" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="videos"
                    stroke={CHART_COLORS.coral}
                    strokeWidth={2}
                    fill="url(#mentorGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category pie chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Content by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="45%"
                      innerRadius={45}
                      outerRadius={70}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {categoryData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={pieColors[i % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No videos yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
