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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify user
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { type, sector, amount } = await req.json();

    if (!type || !amount) {
      return new Response(JSON.stringify({ error: 'Missing required fields: type, amount' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check for existing completed payment for this exam sector
    if (type === 'certification_exam' && sector) {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('user_id', user.id)
        .eq('payment_type', 'certification_exam')
        .eq('status', 'completed')
        .contains('metadata', { sector })
        .maybeSingle();

      if (existingPayment) {
        return new Response(JSON.stringify({ 
          already_paid: true, 
          payment_id: existingPayment.id 
        }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Create payment record
    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        payment_type: type,
        amount_cents: amount,
        currency: 'XCG',
        status: 'pending',
        provider: 'sentoo',
        metadata: sector ? { sector } : {},
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
      })
      .select()
      .single();

    if (insertError) {
      console.error('Payment insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create payment' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // TODO: Call Sentoo API to create payment request
    // Once Sentoo merchant agreement is signed and API docs received:
    // 1. Call Sentoo REST API with payment details
    // 2. Get redirect_url from Sentoo response
    // 3. Return redirect_url to client
    //
    // For now, we simulate a successful payment for testing:
    const sentooApiKey = Deno.env.get('SENTOO_MERCHANT_KEY');
    
    if (!sentooApiKey) {
      // No Sentoo key configured - mark as completed for testing
      console.log('No SENTOO_MERCHANT_KEY configured. Marking payment as completed for testing.');
      
      await supabase
        .from('payments')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', payment.id);

      return new Response(JSON.stringify({
        payment_id: payment.id,
        status: 'completed',
        test_mode: true,
        message: 'Payment completed in test mode (no Sentoo key configured)'
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // When Sentoo is configured, this will create a real payment request
    // and return a redirect_url
    return new Response(JSON.stringify({
      payment_id: payment.id,
      status: 'pending',
      // redirect_url will be provided by Sentoo API
      redirect_url: null,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Create payment error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
