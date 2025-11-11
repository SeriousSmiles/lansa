import { supabase } from '@/integrations/supabase/client';

/**
 * Analytics service for tracking onboarding funnel and drop-off points
 */

export type OnboardingEvent = 
  | 'onboarding_started'
  | 'user_type_selected'
  | 'career_path_selected'
  | 'organization_form_started'
  | 'organization_created'
  | 'organization_joined'
  | 'onboarding_completed'
  | 'onboarding_abandoned'
  | 'onboarding_resumed'
  | 'onboarding_auto_recovered';

interface OnboardingEventMetadata {
  user_type?: 'job_seeker' | 'employer';
  career_path?: string;
  step?: string;
  completion_point?: string;
  error?: string;
  [key: string]: any;
}

/**
 * Track onboarding event for analytics
 */
export async function trackOnboardingEvent(
  userId: string,
  event: OnboardingEvent,
  metadata?: OnboardingEventMetadata
): Promise<void> {
  try {
    const { error } = await supabase.from('user_actions').insert({
      user_id: userId,
      action_type: event,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        source: 'onboarding_analytics'
      }
    });

    if (error) {
      console.error('[OnboardingAnalytics] Failed to track event:', event, error);
    } else {
      console.log('[OnboardingAnalytics] Tracked:', event, metadata);
    }
  } catch (error) {
    console.error('[OnboardingAnalytics] Error tracking event:', error);
  }
}

/**
 * Get onboarding funnel metrics
 */
export async function getOnboardingFunnelMetrics(startDate?: Date, endDate?: Date) {
  try {
    let query = supabase
      .from('user_actions')
      .select('action_type, metadata, created_at')
      .in('action_type', [
        'onboarding_started',
        'user_type_selected',
        'career_path_selected',
        'organization_created',
        'organization_joined',
        'onboarding_completed',
        'onboarding_abandoned',
        'onboarding_auto_recovered'
      ]);

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate funnel metrics
    const metrics = {
      started: data?.filter(d => d.action_type === 'onboarding_started').length || 0,
      type_selected: data?.filter(d => d.action_type === 'user_type_selected').length || 0,
      path_selected: data?.filter(d => d.action_type === 'career_path_selected').length || 0,
      org_created: data?.filter(d => d.action_type === 'organization_created').length || 0,
      org_joined: data?.filter(d => d.action_type === 'organization_joined').length || 0,
      completed: data?.filter(d => d.action_type === 'onboarding_completed').length || 0,
      abandoned: data?.filter(d => d.action_type === 'onboarding_abandoned').length || 0,
      auto_recovered: data?.filter(d => d.action_type === 'onboarding_auto_recovered').length || 0
    };

    // Calculate conversion rates
    const conversionRate = metrics.started > 0 
      ? ((metrics.completed / metrics.started) * 100).toFixed(2)
      : '0';

    const dropOffRate = metrics.started > 0
      ? ((metrics.abandoned / metrics.started) * 100).toFixed(2)
      : '0';

    return {
      metrics,
      conversionRate: parseFloat(conversionRate),
      dropOffRate: parseFloat(dropOffRate),
      totalEvents: data?.length || 0
    };
  } catch (error) {
    console.error('[OnboardingAnalytics] Error fetching funnel metrics:', error);
    return null;
  }
}

/**
 * Get drop-off points in onboarding flow
 */
export async function getOnboardingDropOffPoints() {
  try {
    const { data, error } = await supabase
      .from('user_actions')
      .select('user_id, action_type, metadata, created_at')
      .in('action_type', [
        'onboarding_started',
        'user_type_selected',
        'career_path_selected',
        'onboarding_completed',
        'onboarding_abandoned'
      ])
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by user and find where they dropped off
    const userJourneys = new Map<string, any[]>();
    data?.forEach(event => {
      if (!userJourneys.has(event.user_id)) {
        userJourneys.set(event.user_id, []);
      }
      userJourneys.get(event.user_id)?.push(event);
    });

    const dropOffPoints = {
      after_start: 0,
      after_type_selection: 0,
      after_path_selection: 0,
      completed: 0
    };

    userJourneys.forEach(journey => {
      const hasStarted = journey.some(e => e.action_type === 'onboarding_started');
      const hasSelectedType = journey.some(e => e.action_type === 'user_type_selected');
      const hasSelectedPath = journey.some(e => e.action_type === 'career_path_selected');
      const hasCompleted = journey.some(e => e.action_type === 'onboarding_completed');

      if (hasCompleted) {
        dropOffPoints.completed++;
      } else if (hasSelectedPath) {
        dropOffPoints.after_path_selection++;
      } else if (hasSelectedType) {
        dropOffPoints.after_type_selection++;
      } else if (hasStarted) {
        dropOffPoints.after_start++;
      }
    });

    return dropOffPoints;
  } catch (error) {
    console.error('[OnboardingAnalytics] Error fetching drop-off points:', error);
    return null;
  }
}
