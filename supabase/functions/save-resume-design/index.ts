import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResumeDesign {
  id?: string;
  name: string;
  template_id?: string;
  design_json: any;
  is_default?: boolean;
}

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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { design, designId } = await req.json() as { design: ResumeDesign; designId?: string };

    console.log('Saving resume design for user:', user.id);

    let result;
    if (designId) {
      // Update existing design
      const { data, error } = await supabase
        .from('resume_designs')
        .update({
          name: design.name,
          template_id: design.template_id,
          design_json: design.design_json,
          is_default: design.is_default,
          updated_at: new Date().toISOString()
        })
        .eq('id', designId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
      console.log('Updated design:', designId);
    } else {
      // Create new design
      const { data, error } = await supabase
        .from('resume_designs')
        .insert({
          user_id: user.id,
          name: design.name,
          template_id: design.template_id,
          design_json: design.design_json,
          is_default: design.is_default || false
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
      console.log('Created new design:', result.id);
    }

    return new Response(JSON.stringify({ success: true, design: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error saving resume design:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
