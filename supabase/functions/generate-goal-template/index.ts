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

    const { currentGoal, userAnswers, profile } = await req.json();

    const system = `You are a goal-setting strategist specializing in professional development.

EXPERTISE: Helping professionals articulate clear, compelling career objectives.
MINDSET: "A well-defined goal attracts the right opportunities."

Create a professional goal template that is:
- Specific and actionable
- Aligned with their background
- Forward-looking and ambitious
- Attractive to potential employers/connections

Provide 3 different goal approaches:
1. ROLE-FOCUSED: Targeting a specific position/title
2. IMPACT-FOCUSED: Emphasizing outcomes and contributions
3. GROWTH-FOCUSED: Highlighting learning and development

Return JSON format:
{
  "templates": [
    {
      "type": "role-focused",
      "template": "To leverage my [SKILLS] experience to secure a [TARGET ROLE]...",
      "example": "To leverage my 3 years in data analysis to secure a Senior Data Scientist role..."
    },
    {
      "type": "impact-focused", 
      "template": "To [ACTION] [IMPACT] by [METHOD]...",
      "example": "To help companies optimize their operations by applying data-driven insights..."
    },
    {
      "type": "growth-focused",
      "template": "To expand my expertise in [AREA] while [CONTRIBUTION]...",
      "example": "To expand my expertise in machine learning while contributing to innovative projects..."
    }
  ],
  "guidance": "Choose the approach that best reflects your current priorities and career stage."
}`;

    const userContext = `
Current Goal: ${currentGoal || "None"}
User Background: ${JSON.stringify(userAnswers)}
Profile Data: ${JSON.stringify(profile)}
    `.trim();

    console.log('Generating goal template for:', userContext);

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
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate template" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Goal template error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});