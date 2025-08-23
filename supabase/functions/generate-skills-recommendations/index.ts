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

    const { currentSkills, userAnswers, profile } = await req.json();

    const system = `You are a skills assessment expert specializing in career development and industry trends.

EXPERTISE: Identifying relevant skills for specific career paths and industries.
MINDSET: "The right skills showcase opens doors to opportunities."

Analyze the user's background and recommend skills in 3 categories:

1. CORE SKILLS: Essential for their field (5-7 skills)
2. TRENDING SKILLS: In-demand for their industry (3-5 skills)  
3. GROWTH SKILLS: For future career advancement (3-4 skills)

Focus on:
- Industry-relevant skills
- Both technical and soft skills
- Skills that align with their career goals
- Skills they likely already have but haven't listed

Return JSON format:
{
  "recommendations": {
    "core": [
      {"skill": "...", "category": "technical/soft", "relevance": "..."},
      ...
    ],
    "trending": [
      {"skill": "...", "category": "technical/soft", "relevance": "..."},
      ...
    ],
    "growth": [
      {"skill": "...", "category": "technical/soft", "relevance": "..."},
      ...
    ]
  },
  "guidance": "Tips on how to prioritize and develop these skills..."
}`;

    const userContext = `
Current Skills: ${JSON.stringify(currentSkills || [])}
User Background: ${JSON.stringify(userAnswers)}
Profile Data: ${JSON.stringify(profile)}
    `.trim();

    console.log('Generating skills recommendations for:', userContext);

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
        temperature: 0.5,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate recommendations" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Skills recommendations error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});