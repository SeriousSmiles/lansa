import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, subDays, format } from 'date-fns';

export interface SegmentDistribution {
  purple: number;
  green: number;
  orange: number;
  red: number;
  total: number;
}

export interface SegmentChangeEvent {
  date: string;
  old_segment: string | null;
  new_segment: string;
  count: number;
}

export interface EmailDeliveryMetrics {
  date: string;
  total_sent: number;
  to_red: number;
  to_orange: number;
  to_green: number;
  from_red: number;
}

export interface EmailLogEntry {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  old_segment: string | null;
  new_segment: string;
  email_sent_at: string;
}

export function useSegmentStatistics(days: number = 30) {
  return useQuery({
    queryKey: ['admin-segment-statistics', days],
    queryFn: async () => {
      const startDate = startOfDay(subDays(new Date(), days));
      
      // Get current segment distribution
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('color_auto, color_admin');
      
      if (profilesError) throw profilesError;
      
      const distribution: SegmentDistribution = {
        purple: 0,
        green: 0,
        orange: 0,
        red: 0,
        total: profiles?.length || 0
      };
      
      profiles?.forEach(profile => {
        const effectiveColor = profile.color_admin || profile.color_auto;
        if (effectiveColor) {
          distribution[effectiveColor as keyof Omit<SegmentDistribution, 'total'>]++;
        }
      });
      
      // Get ALL-TIME segment email log for summary counts
      const { data: allEmailLog, error: allEmailError } = await supabase
        .from('segment_email_log')
        .select('old_segment, new_segment, email_sent_at, user_id')
        .order('email_sent_at', { ascending: false });
      
      if (allEmailError) throw allEmailError;

      // Get windowed data for charts
      const { data: emailLog, error: emailError } = await supabase
        .from('segment_email_log')
        .select('old_segment, new_segment, email_sent_at')
        .gte('email_sent_at', startDate.toISOString())
        .order('email_sent_at', { ascending: true });
      
      if (emailError) throw emailError;

      // Fetch email log with user names for the log table (last 50)
      const { data: emailLogWithUsers } = await supabase
        .from('segment_email_log')
        .select('id, user_id, old_segment, new_segment, email_sent_at')
        .order('email_sent_at', { ascending: false })
        .limit(50);

      // Build email log entries with user names
      let emailLogEntries: EmailLogEntry[] = [];
      if (emailLogWithUsers && emailLogWithUsers.length > 0) {
        const userIds = [...new Set(emailLogWithUsers.map(e => e.user_id))];
        const { data: userProfiles } = await supabase
          .from('user_profiles')
          .select('user_id, name, email')
          .in('user_id', userIds);

        const userMap = new Map(userProfiles?.map(u => [u.user_id, u]) || []);

        emailLogEntries = emailLogWithUsers.map(entry => {
          const profile = userMap.get(entry.user_id);
          return {
            id: entry.id,
            user_id: entry.user_id,
            user_name: profile?.name || null,
            user_email: profile?.email || null,
            old_segment: entry.old_segment,
            new_segment: entry.new_segment,
            email_sent_at: entry.email_sent_at,
          };
        });
      }
      
      // Group windowed data by date for trend charts
      const emailsByDate = new Map<string, EmailDeliveryMetrics>();
      
      emailLog?.forEach(log => {
        const date = format(new Date(log.email_sent_at), 'MMM d');
        
        if (!emailsByDate.has(date)) {
          emailsByDate.set(date, {
            date,
            total_sent: 0,
            to_red: 0,
            to_orange: 0,
            to_green: 0,
            from_red: 0
          });
        }
        const metrics = emailsByDate.get(date)!;
        metrics.total_sent++;
        
        if (log.new_segment === 'red') metrics.to_red++;
        if (log.new_segment === 'orange') metrics.to_orange++;
        if (log.new_segment === 'green') metrics.to_green++;
        if (log.old_segment === 'red' && log.new_segment !== 'red') metrics.from_red++;
      });
      
      const emailMetrics = Array.from(emailsByDate.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      
      // Calculate key metrics from ALL-TIME data
      const totalEmailsSent = allEmailLog?.length || 0;
      // "Drifting Alerts" = emails sent when user entered the red segment
      const driftingAlertEmails = allEmailLog?.filter(e => e.new_segment === 'red').length || 0;
      // "Recoveries" = emails sent when user came back FROM drifting
      const recoveryEmails = allEmailLog?.filter(e => e.old_segment === 'red' && e.new_segment !== 'red').length || 0;
      
      return {
        distribution,
        emailMetrics,
        emailLogEntries,
        summary: {
          totalEmailsSent,
          driftingAlertEmails,
          recoveryEmails,
          averageEmailsPerDay: emailMetrics.length > 0 
            ? (emailLog?.length || 0) / emailMetrics.length 
            : 0
        }
      };
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}
