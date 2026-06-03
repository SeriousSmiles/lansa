import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

const fallbackBullets = (j: any): string[] => {
  const out: string[] = [];
  if (j.title) out.push(`Role: ${j.title}`);
  if (j.location) out.push(`Location: ${j.location}${j.is_remote ? ' (remote-friendly)' : ''}`);
  if (Array.isArray(j.skills_required) && j.skills_required.length) {
    out.push(`Key skills: ${j.skills_required.slice(0, 5).join(', ')}`);
  }
  if (j.description) {
    const firstSentence = String(j.description).split(/(?<=[.!?])\s+/).slice(0, 1).join(' ');
    if (firstSentence) out.push(firstSentence.trim());
  }
  if (j.salary_range) out.push(`Compensation: ${j.salary_range}`);
  return out.slice(0, 5);
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { job_id } = await req.json();
    if (!job_id || typeof job_id !== 'string') {
      return new Response(JSON.stringify({ error: 'job_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: job, error } = await admin
      .from('job_listings_v2')
      .select('id,title,description,location,is_remote,salary_range,skills_required,ai_summary_bullets')
      .eq('id', job_id)
      .maybeSingle();

    if (error || !job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (Array.isArray(job.ai_summary_bullets) && job.ai_summary_bullets.length >= 3) {
      return new Response(JSON.stringify({ bullets: job.ai_summary_bullets, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Summarize this job posting into 3 to 5 concise, scannable bullet points for a candidate browsing on mobile. Each bullet under 14 words. Focus on what the role is, who it's for, key skills, working style (remote/onsite/team), and one standout perk if any. Do not repeat the job title verbatim. Do not mention compensation.\n\nJob title: ${job.title}\nLocation: ${job.location ?? 'N/A'}${job.is_remote ? ' (remote)' : ''}\nSkills: ${Array.isArray(job.skills_required) ? job.skills_required.join(', ') : ''}\nDescription:\n${job.description ?? ''}`;

    let bullets: string[] = [];
    try {
      const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: 'You write tight, useful job-card bullet summaries. Respond only via the provided tool.' },
            { role: 'user', content: prompt },
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'emit_summary',
              description: 'Emit 3-5 short job summary bullets.',
              parameters: {
                type: 'object',
                properties: {
                  bullets: { type: 'array', items: { type: 'string' } },
                },
                required: ['bullets'],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: 'function', function: { name: 'emit_summary' } },
        }),
      });

      if (aiResp.status === 429 || aiResp.status === 402) {
        bullets = fallbackBullets(job);
      } else if (!aiResp.ok) {
        console.error('AI gateway error', aiResp.status, await aiResp.text());
        bullets = fallbackBullets(job);
      } else {
        const json = await aiResp.json();
        const call = json.choices?.[0]?.message?.tool_calls?.[0];
        const args = call?.function?.arguments ? JSON.parse(call.function.arguments) : null;
        if (args && Array.isArray(args.bullets) && args.bullets.length >= 3) {
          bullets = args.bullets.slice(0, 5).map((b: any) => String(b).trim()).filter(Boolean);
        } else {
          bullets = fallbackBullets(job);
        }
      }
    } catch (e) {
      console.error('AI call failed', e);
      bullets = fallbackBullets(job);
    }

    if (bullets.length >= 3) {
      await admin.from('job_listings_v2').update({ ai_summary_bullets: bullets }).eq('id', job_id);
    }

    return new Response(JSON.stringify({ bullets, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('job-ai-summary error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});