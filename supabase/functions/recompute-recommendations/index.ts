import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScoringFactors {
  skillsOverlap: number;
  categoryMatch: number;
  jobTypeMatch: number;
  remoteMatch: number;
  behaviorBoost: number;
  freshnessBoost: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting recommendation recomputation...');

    // Get all active users with preferences
    const { data: users } = await supabase
      .from('user_profiles')
      .select('user_id, skills, career_path')
      .not('user_id', 'is', null);

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${users.length} users`);

    let totalRecommendations = 0;

    for (const user of users) {
      // Get user preferences
      const { data: prefs } = await supabase
        .from('user_job_prefs')
        .select('*')
        .eq('user_id', user.user_id)
        .maybeSingle();

      // Get user interactions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: interactions } = await supabase
        .from('job_interactions')
        .select('job_id, type, created_at')
        .eq('user_id', user.user_id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get all active jobs
      const { data: jobs } = await supabase
        .from('job_listings_v2')
        .select('id, category, job_type, skills_required, is_remote, posted_at, target_user_types')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      if (!jobs || jobs.length === 0) continue;

      const recommendations: Array<{
        user_id: string;
        job_id: string;
        score: number;
        reason: string;
      }> = [];

      const userSkills = (user.skills || []) as string[];
      const interactionMap = new Map(interactions?.map(i => [i.job_id, i]) || []);

      for (const job of jobs) {
        // Skip if already applied
        if (interactionMap.get(job.id)?.type === 'apply') continue;

        // Check target user types
        const targetTypes = (job.target_user_types || []) as string[];
        if (targetTypes.length > 0 && !targetTypes.includes(user.career_path)) {
          continue;
        }

        const factors: ScoringFactors = {
          skillsOverlap: 0,
          categoryMatch: 0,
          jobTypeMatch: 0,
          remoteMatch: 0,
          behaviorBoost: 0,
          freshnessBoost: 0,
        };

        const reasons: string[] = [];

        // Skills overlap (0-0.5)
        const jobSkills = (job.skills_required || []) as string[];
        if (jobSkills.length > 0 && userSkills.length > 0) {
          const matchingSkills = userSkills.filter(s => 
            jobSkills.some(js => js.toLowerCase().includes(s.toLowerCase()))
          );
          if (matchingSkills.length > 0) {
            factors.skillsOverlap = Math.min(0.5, matchingSkills.length / jobSkills.length * 0.5);
            reasons.push(`Matches your skills: ${matchingSkills.slice(0, 3).join(', ')}`);
          }
        }

        // Category match (+0.2)
        if (prefs?.categories && Array.isArray(prefs.categories)) {
          if (prefs.categories.includes(job.category)) {
            factors.categoryMatch = 0.2;
            reasons.push(`In your preferred category: ${job.category}`);
          }
        }

        // Job type match (+0.1)
        if (prefs?.job_types && Array.isArray(prefs.job_types)) {
          if (prefs.job_types.includes(job.job_type)) {
            factors.jobTypeMatch = 0.1;
          }
        }

        // Remote match (+0.05)
        if (prefs?.remote_only && job.is_remote) {
          factors.remoteMatch = 0.05;
          reasons.push('Remote position');
        }

        // Behavior boost (recent saves/applies in same category)
        const recentCategoryInteractions = interactions?.filter(i => 
          i.type === 'save' || i.type === 'apply'
        ) || [];
        if (recentCategoryInteractions.length > 0) {
          factors.behaviorBoost = Math.min(0.2, recentCategoryInteractions.length * 0.05);
        }

        // Freshness boost (<72h)
        const postedAt = new Date(job.posted_at);
        const hoursSincePosted = (Date.now() - postedAt.getTime()) / (1000 * 60 * 60);
        if (hoursSincePosted < 72) {
          factors.freshnessBoost = 0.05;
          reasons.push('New posting');
        }

        // Calculate total score
        const totalScore = Object.values(factors).reduce((sum, val) => sum + val, 0);

        // Only save recommendations with score > 0
        if (totalScore > 0) {
          recommendations.push({
            user_id: user.user_id,
            job_id: job.id,
            score: totalScore,
            reason: reasons.length > 0 ? reasons.join(' • ') : 'Recommended for you',
          });
        }
      }

      // Sort and keep top 50 recommendations per user
      recommendations.sort((a, b) => b.score - a.score);
      const topRecommendations = recommendations.slice(0, 50);

      if (topRecommendations.length > 0) {
        // Delete old recommendations
        await supabase
          .from('job_recommendations')
          .delete()
          .eq('user_id', user.user_id);

        // Insert new recommendations
        const { error: insertError } = await supabase
          .from('job_recommendations')
          .insert(topRecommendations);

        if (insertError) {
          console.error(`Error inserting recommendations for user ${user.user_id}:`, insertError);
        } else {
          totalRecommendations += topRecommendations.length;
          console.log(`Created ${topRecommendations.length} recommendations for user ${user.user_id}`);
        }
      }
    }

    console.log(`Recommendation recomputation complete. Total: ${totalRecommendations}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        users_processed: users.length,
        total_recommendations: totalRecommendations 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in recompute-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
