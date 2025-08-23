import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not found" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { currentTitle, userAnswers, profile } = await req.json();

    const system = `You are a LinkedIn headline optimization expert with 10+ years helping professionals craft compelling titles.

EXPERTISE: Creating headlines that get noticed by recruiters and hiring managers.
MINDSET: "Your headline is your first impression - make it count."

Generate 3 professional headline variations:
1. CONSERVATIVE: Traditional, safe for corporate environments
2. BALANCED: Modern but professional, shows personality
3. BOLD: Confident, memorable, stands out from crowd

Use the user's background, skills, and career goals to create targeted headlines.
Each should be 10-15 words max and include relevant keywords.

Return JSON format:
{
  "suggestions": [
    {"type": "conservative", "title": "...", "reasoning": "..."},
    {"type": "balanced", "title": "...", "reasoning": "..."},
    {"type": "bold", "title": "...", "reasoning": "..."}
  ]
}`;

    const userContext = `
Current Title: ${currentTitle || "None"}
User Background: ${JSON.stringify(userAnswers)}
Profile Data: ${JSON.stringify(profile)}
    `.trim();

    console.log('Generating title suggestions for:', userContext);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userContext },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate suggestions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Title suggestions error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});