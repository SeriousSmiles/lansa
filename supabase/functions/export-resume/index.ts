import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportOptions {
  format: 'pdf' | 'png' | 'jpeg';
  include_photo?: boolean;
  ats_mode?: boolean;
  sections?: string[];
  dpi?: number;
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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { design_id, design_json, options } = await req.json() as {
      design_id?: string;
      design_json: any;
      options: ExportOptions;
    };

    console.log('Exporting resume for user:', user.id, 'format:', options.format);

    // Generate hash for caching
    const designString = JSON.stringify({ design_json, options });
    const encoder = new TextEncoder();
    const data = encoder.encode(designString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check if export already exists
    const { data: existingExport } = await supabase
      .from('resume_exports')
      .select('*')
      .eq('user_id', user.id)
      .eq('file_hash', fileHash)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingExport) {
      console.log('Returning cached export:', existingExport.id);
      return new Response(JSON.stringify({
        success: true,
        file_url: existingExport.file_url,
        export_id: existingExport.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // TODO: Implement actual vector rendering with PDFKit/Sharp
    // For now, return a placeholder response
    console.log('Vector rendering not yet implemented - using HTML fallback');
    
    // Placeholder: In production, this would:
    // 1. Parse design_json layers
    // 2. Render with PDFKit (for PDF) or Sharp (for PNG/JPEG)
    // 3. Upload to Supabase Storage
    // 4. Return public URL

    const placeholderUrl = `https://placeholder.com/resume-${user.id}-${fileHash}.${options.format}`;

    // Store export record
    const { data: exportRecord, error: exportError } = await supabase
      .from('resume_exports')
      .insert({
        user_id: user.id,
        design_id: design_id,
        format: options.format,
        file_url: placeholderUrl,
        file_hash: fileHash,
        options: options,
      })
      .select()
      .single();

    if (exportError) throw exportError;

    console.log('Created export record:', exportRecord.id);

    return new Response(JSON.stringify({
      success: true,
      file_url: placeholderUrl,
      export_id: exportRecord.id,
      note: 'Vector rendering engine will be implemented in production'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error exporting resume:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
