import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { payment_id, provider_payment_id, status } = body;

    // TODO: Validate Sentoo webhook signature
    // const sentooSecret = Deno.env.get('SENTOO_WEBHOOK_SECRET');
    // const signature = req.headers.get('x-sentoo-signature');
    // if (!validateSignature(signature, body, sentooSecret)) { ... }

    if (!payment_id) {
      return new Response(JSON.stringify({ error: 'Missing payment_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update payment status
    const updateData: Record<string, unknown> = {
      status: status || 'completed',
      provider_payment_id: provider_payment_id || null,
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', payment_id)
      .select()
      .single();

    if (updateError) {
      console.error('Payment update error:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update payment' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Payment ${payment_id} updated to status: ${status}`);

    return new Response(JSON.stringify({ success: true, payment }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
