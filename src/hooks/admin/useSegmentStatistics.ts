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
      
      // Get segment change history from email log
      const { data: emailLog, error: emailError } = await supabase
        .from('segment_email_log')
        .select('old_segment, new_segment, email_sent_at')
        .gte('email_sent_at', startDate.toISOString())
        .order('email_sent_at', { ascending: true });
      
      if (emailError) throw emailError;
      
      // Group by date for trend analysis
      const changesByDate = new Map<string, Map<string, number>>();
      const emailsByDate = new Map<string, EmailDeliveryMetrics>();
      
      emailLog?.forEach(log => {
        const date = format(new Date(log.email_sent_at), 'yyyy-MM-dd');
        const transitionKey = `${log.old_segment || 'new'}_to_${log.new_segment}`;
        
        // Track changes
        if (!changesByDate.has(date)) {
          changesByDate.set(date, new Map());
        }
        const dateChanges = changesByDate.get(date)!;
        dateChanges.set(transitionKey, (dateChanges.get(transitionKey) || 0) + 1);
        
        // Track emails
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
        if (log.old_segment === 'red') metrics.from_red++;
      });
      
      // Convert maps to arrays for charting
      const segmentChanges: SegmentChangeEvent[] = [];
      changesByDate.forEach((changes, date) => {
        changes.forEach((count, transition) => {
          const [from, to] = transition.split('_to_');
          segmentChanges.push({
            date,
            old_segment: from === 'new' ? null : from,
            new_segment: to,
            count
          });
        });
      });
      
      const emailMetrics = Array.from(emailsByDate.values()).sort((a, b) => 
        a.date.localeCompare(b.date)
      );
      
      // Calculate key metrics
      const totalEmailsSent = emailLog?.length || 0;
      const reEngagementEmails = emailLog?.filter(e => e.new_segment === 'red').length || 0;
      const recoveryEmails = emailLog?.filter(e => e.old_segment === 'red' && e.new_segment !== 'red').length || 0;
      
      return {
        distribution,
        segmentChanges,
        emailMetrics,
        summary: {
          totalEmailsSent,
          reEngagementEmails,
          recoveryEmails,
          averageEmailsPerDay: emailMetrics.length > 0 
            ? totalEmailsSent / emailMetrics.length 
            : 0
        }
      };
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}
