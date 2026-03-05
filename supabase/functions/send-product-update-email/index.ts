import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DASHBOARD_URL = 'https://lansa.online/dashboard';
const LANSA_LOGO_B64 = 'PHN2ZyB3aWR0aD0iMTk1IiBoZWlnaHQ9IjI3OCIgdmlld0JveD0iMCAwIDE5NSAyNzgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xOTIuMjQgNzkuNDI5N0MxOTMuMzE1IDc5LjM3OCAxOTQuMjI1IDgwLjE3ODYgMTk0LjI5OSA4MS4yNDAyQzE5OC4yODEgMTM4LjI1NiAxNjIuNDQ0IDIwMC45OTggMTE1LjY0IDI1Mi43NDVDMTE0LjkzNCAyNTMuNTI1IDExMy42MzMgMjUyLjgyIDExMy44ODkgMjUxLjgwNUMxMTcuOTYgMjM1LjY1MiAxMTguNjA0IDIyMS4yODggMTE1LjgyMSAyMDguNzFDOTMuNTU4MyAyNDQuNjI5IDQxLjQ2MjQgMjcyLjE4NCAzLjE3OTY5IDI3Ny45NjRDMC4zODIgMjc4LjM4NiAtMS4wOTQ4NyAyNzUuMDgxIDAuOTYwOTM4IDI3My4xNTdDNTMuNjI4OCAyMjMuODgzIDcyLjMzNjIgMjAyLjE3NCA5MC4yMTM5IDE3NC4xNDNDNjMuOTk2NyAxODguMDA1IDQyLjMzNDIgMTk3Ljc4OCAyMi4wOTY3IDIwMS4yMThDMTkuOTIxNSAyMDEuNTg2IDE4LjIxMzkgMTk5LjQ4MiAxOC45NDYzIDE5Ny40MjRDNTEuNzQ5MSAxMDUuMjUyIDEzMC43MiA4Mi4zODkyIDE5Mi4yNCA3OS40Mjk3Wk0xMTUuMTcxIDBDMTM0LjkxMSAwIDE1MC45MTQgMTYuODkxNiAxNTAuOTE0IDM3LjcyODVDMTUwLjkxNCA1OC41NjU2IDEzNC45MTEgNzUuNDU4IDExNS4xNzEgNzUuNDU4Qzk1LjQzMDYgNzUuNDU3OSA3OS40Mjc3IDU4LjU2NTUgNzkuNDI3NyAzNy43Mjg1Qzc5LjQyNzkgMTYuODkxNyA5NS40MzA3IDAuMDAwMTA4OTUgMTE1LjE3MSAwWiIgZmlsbD0iIzFBMUY3MSIvPgo8L3N2Zz4=';

const CATEGORY_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  feature: { label: 'New Feature', color: '#2563eb', emoji: '✨' },
  improvement: { label: 'Improvement', color: '#059669', emoji: '⚡' },
  bugfix: { label: 'Bug Fix', color: '#d97706', emoji: '🔧' },
  announcement: { label: 'Announcement', color: '#7c3aed', emoji: '📣' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    // Verify admin
    const token = authHeader.replace('Bearer ', '');
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const userId = claimsData.claims.sub;
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: roleData } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return jsonResponse({ error: 'Admin access required' }, 403);
    }

    const { update_id } = await req.json();
    if (!update_id) {
      return jsonResponse({ error: 'update_id is required' }, 400);
    }

    // Fetch the product update
    const { data: update, error: updateError } = await serviceClient
      .from('product_updates')
      .select('*')
      .eq('id', update_id)
      .single();

    if (updateError || !update) {
      return jsonResponse({ error: 'Product update not found' }, 404);
    }

    // Fetch all users with emails
    const { data: users, error: usersError } = await serviceClient
      .from('user_profiles')
      .select('user_id, name, email')
      .not('email', 'is', null)
      .neq('email', '');

    if (usersError) throw usersError;
    if (!users?.length) return jsonResponse({ sent: 0, failed: 0 });

    const resend = new Resend(resendApiKey);
    const catConfig = CATEGORY_CONFIG[update.category] || { label: update.category, color: '#1A1F71', emoji: '📋' };
    const ctaUrl = update.link_url || DASHBOARD_URL;

    console.log(`[send-product-update-email] Sending update "${update.title}" to ${users.length} users`);

    let sent = 0;
    let failed = 0;

    // Send in batches of 10 to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await Promise.all(batch.map(async (user) => {
        if (!user.email) { failed++; return; }

        const html = buildProductUpdateEmail({
          userName: user.name || 'there',
          title: update.title,
          description: update.description,
          category: catConfig.label,
          categoryColor: catConfig.color,
          categoryEmoji: catConfig.emoji,
          version: update.version,
          ctaUrl,
          imageUrl: update.image_url,
        });

        const subject = `${catConfig.emoji} ${catConfig.label}: ${update.title}`;

        try {
          const { error: sendError } = await resend.emails.send({
            from: 'Lansa <noreply@notification.lansa.online>',
            to: [user.email],
            subject,
            html,
          });

          if (sendError) {
            console.error(`Failed for ${user.email}:`, sendError);
            failed++;
          } else {
            sent++;
          }
        } catch (e) {
          console.error(`Exception for ${user.email}:`, e);
          failed++;
        }
      }));
    }

    console.log(`[send-product-update-email] Done. Sent: ${sent}, Failed: ${failed}`);
    return jsonResponse({ sent, failed });

  } catch (error: any) {
    console.error('[send-product-update-email] Error:', error);
    return jsonResponse({ error: error.message }, 500);
  }
});

function jsonResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

interface ProductUpdateEmailParams {
  userName: string;
  title: string;
  description: string;
  category: string;
  categoryColor: string;
  categoryEmoji: string;
  version?: string | null;
  ctaUrl: string;
  imageUrl?: string | null;
}

function buildProductUpdateEmail(p: ProductUpdateEmailParams): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${p.title}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#1A1F71;padding:28px 40px;text-align:center;">
            <img src="data:image/svg+xml;base64,${LANSA_LOGO_B64}" alt="Lansa" width="26" height="38" style="display:inline-block;filter:brightness(0) invert(1);" />
            <p style="color:#ffffff;opacity:0.6;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:10px 0 0;">Platform Update</p>
          </td>
        </tr>
        <!-- Category Badge -->
        <tr>
          <td style="padding:28px 40px 0;text-align:left;">
            <span style="display:inline-block;background:${p.categoryColor}1a;color:${p.categoryColor};border:1px solid ${p.categoryColor}40;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">
              ${p.categoryEmoji} ${p.category}${p.version ? ` · v${p.version}` : ''}
            </span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:16px 40px 32px;">
            <h1 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 12px;line-height:1.35;">${p.title}</h1>
            <p style="color:#374151;font-size:15px;line-height:1.65;margin:0 0 24px;">${p.description}</p>
            ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.title}" style="width:100%;border-radius:8px;margin-bottom:24px;display:block;" />` : ''}
            <a href="${p.ctaUrl}" style="display:inline-block;background:#1A1F71;color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:8px;font-size:14px;font-weight:600;">See What's New →</a>
          </td>
        </tr>
        <!-- Divider -->
        <tr><td style="padding:0 40px;"><hr style="border:0;border-top:1px solid #e5e7eb;margin:0;" /></td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;text-align:center;">
            <p style="color:#9ca3af;font-size:11px;margin:0 0 4px;">Lansa — Career Intelligence Platform</p>
            <p style="color:#9ca3af;font-size:11px;margin:0;">You're receiving this because you have a Lansa account.<br>
            <a href="${DASHBOARD_URL}" style="color:#6b7280;">Manage preferences</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
