import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { industry, inputs } = await req.json();

    if (!industry || !inputs) {
      return new Response(
        JSON.stringify({ error: "Missing industry or inputs" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Lansa's hiring intelligence engine. You analyze employer hiring data and produce sharp, specific, actionable insights.

Given an employer's industry and their specific situation data, you MUST call the "produce_insight" tool with a response that is:
- Specific to their exact numbers (reference their inputs directly)
- Data-driven and credible
- Tied to how Lansa's certified talent pool and AI matching solves their problem

IMPORTANT: The headline_stat should be a single bold number, percentage, or dollar figure that captures the core insight. Make it punchy and memorable.
The analysis should be 2-3 sentences that contextualize their specific situation using their actual numbers.
The recommendation should be 1-2 sentences on how Lansa specifically addresses their pain point.`;

    const userPrompt = `Industry: ${industry}
Employer's situation data:
${Object.entries(inputs).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

Analyze this employer's hiring situation and produce a personalized insight.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "produce_insight",
              description: "Return a structured hiring insight for the employer.",
              parameters: {
                type: "object",
                properties: {
                  headline_stat: {
                    type: "string",
                    description: "A bold number, percentage, or dollar figure (e.g. '$47,000', '73%', '5 days')",
                  },
                  headline_label: {
                    type: "string",
                    description: "Short label explaining what the stat means (e.g. 'estimated annual cost of turnover')",
                  },
                  analysis: {
                    type: "string",
                    description: "2-3 sentences contextualizing their specific situation with their actual numbers",
                  },
                  recommendation: {
                    type: "string",
                    description: "1-2 sentences on how Lansa specifically solves this problem",
                  },
                },
                required: ["headline_stat", "headline_label", "analysis", "recommendation"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "produce_insight" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      throw new Error("AI did not return structured output");
    }

    const insight = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(insight), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("b2b-industry-insight error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
