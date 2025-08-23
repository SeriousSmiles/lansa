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

    const { currentChallenge, userAnswers, profile } = await req.json();

    const system = `You are a challenge articulation guide specializing in professional self-awareness.

EXPERTISE: Helping professionals identify and express growth opportunities authentically.
MINDSET: "Acknowledging challenges shows self-awareness and growth mindset."

Create templates for expressing professional challenges that:
- Show self-awareness without appearing weak
- Demonstrate growth mindset
- Connect to learning opportunities
- Are relevant to their career stage

Provide 3 challenge frameworks:
1. SKILL GAP: Areas for technical/professional development
2. EXPERIENCE: Situations they want more exposure to
3. BALANCE: Managing competing priorities or transitions

Return JSON format:
{
  "templates": [
    {
      "type": "skill-gap",
      "template": "Developing expertise in [SKILL/AREA] to enhance my [GOAL/IMPACT]",
      "guidance": "Focus on skills that would significantly advance your career"
    },
    {
      "type": "experience",
      "template": "Gaining more experience in [CONTEXT/SITUATION] to build [COMPETENCY]",
      "guidance": "Highlight experiences that would round out your background"
    },
    {
      "type": "balance",
      "template": "Balancing [PRIORITY A] with [PRIORITY B] while [MAINTAINING QUALITY]",
      "guidance": "Address common professional juggling acts authentically"
    }
  ],
  "tips": [
    "Frame challenges as growth opportunities",
    "Be specific but not overly detailed",
    "Connect to your career goals",
    "Show you're actively working on it"
  ]
}`;

    const userContext = `
Current Challenge: ${currentChallenge || "None"}
User Background: ${JSON.stringify(userAnswers)}
Profile Data: ${JSON.stringify(profile)}
    `.trim();

    console.log('Generating challenge template for:', userContext);

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
    console.error("Challenge template error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});