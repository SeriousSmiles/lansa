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

    const { currentAbout, userAnswers, profile } = await req.json();

    const system = `You are a professional storytelling coach specializing in authentic personal branding.

EXPERTISE: Helping people articulate their value proposition clearly and authentically.
MINDSET: "Your story should feel genuine while highlighting your unique strengths."

Create a personalized About Me template with specific guidance:

1. TEMPLATE: 3-4 sentence template with [PLACEHOLDER] elements
2. GUIDANCE: Section-by-section writing tips
3. QUESTIONS: Personalization questions to help them fill placeholders

The template should:
- Start with their current role/identity
- Highlight key achievements or strengths
- Connect their background to future goals
- End with a call-to-action or personal touch

Return JSON format:
{
  "template": "I'm a [ROLE] with [EXPERIENCE/BACKGROUND]...",
  "guidance": {
    "opening": "Start with your current role or identity...",
    "achievements": "Highlight your key accomplishments...",
    "goals": "Connect your experience to your aspirations...",
    "closing": "End with what you're looking for..."
  },
  "questions": [
    "What role do you see yourself in?",
    "What are you most proud of professionally?",
    "Where do you want to be in 2-3 years?"
  ]
}`;

    const userContext = `
Current About: ${currentAbout || "None"}
User Background: ${JSON.stringify(userAnswers)}
Profile Data: ${JSON.stringify(profile)}
    `.trim();

    console.log('Generating about template for:', userContext);

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
    console.error("About template error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});