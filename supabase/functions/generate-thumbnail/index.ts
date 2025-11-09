import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { design_id, design_json } = await req.json();

    console.log('Generating thumbnail for design:', design_id);

    // TODO: Implement thumbnail generation using Sharp
    // This would:
    // 1. Render design_json at 300x400px
    // 2. Upload to Supabase Storage (user-uploads bucket)
    // 3. Update resume_designs.thumbnail_url

    const placeholderThumbnail = `https://placeholder.com/thumb-${design_id}.png`;

    if (design_id) {
      const { error: updateError } = await supabase
        .from('resume_designs')
        .update({ thumbnail_url: placeholderThumbnail })
        .eq('id', design_id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    }

    console.log('Thumbnail generated:', placeholderThumbnail);

    return new Response(JSON.stringify({
      success: true,
      thumbnail_url: placeholderThumbnail,
      note: 'Thumbnail rendering will be implemented with Sharp in production'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
