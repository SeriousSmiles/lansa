import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OnboardingInputs {
  identity?: string;
  desired_outcome?: string;
  aspiration_text?: string;
  challenges_text?: string;
  expectations_text?: string;
  // Allow any extra fields
  [key: string]: unknown;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ONBOARDING_AI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ONBOARDING_AI_API_KEY is not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { answers } = await req.json();
    const inputs: OnboardingInputs = answers || {};

    const system = `You are a concise career positioning coach. Generate a short, inspiring, strictly-JSON summary card based on user onboarding answers.
- Keep tone encouraging, practical, and human.
- Return valid JSON only. No markdown, no prose.
- Follow this JSON schema exactly:
{
  "identity_summary": string,        // 1-2 short sentences reflecting who they are today
  "role": string,                    // a crisp role label derived from identity
  "aspiration": string,              // one inspiring sentence about where they want to go
  "challenges": string[],            // 2-4 concrete obstacles in bullet style
  "focus_pillars": [                 // 3 titled focus areas with 1-line descriptions
    { "title": string, "description": string },
    { "title": string, "description": string },
    { "title": string, "description": string }
  ],
  "prompt_version": "v1"
}`;

    const userContent = [
      { key: "identity", label: "Identity", value: inputs.identity },
      { key: "desired_outcome", label: "Desired outcome", value: inputs.desired_outcome },
      { key: "aspiration_text", label: "Aspiration (user text)", value: inputs.aspiration_text },
      { key: "challenges_text", label: "Challenges (user text)", value: inputs.challenges_text },
      { key: "expectations_text", label: "Expectations (user text)", value: inputs.expectations_text },
    ]
      .filter((x) => x.value)
      .map((x) => `${x.label}: ${x.value}`)
      .join("\n");

    const body = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent || "User provided minimal info. Produce a generic-yet-useful card." },
      ],
      temperature: 0.6,
      response_format: { type: "json_object" },
    } as const;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errTxt = await response.text();
      console.error("OpenAI error:", errTxt);
      return new Response(
        JSON.stringify({ error: "OpenAI request failed", details: errTxt }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Ensure valid JSON
    let card: unknown;
    try {
      card = typeof content === "string" ? JSON.parse(content) : content;
    } catch (_e) {
      // As a fallback, wrap content
      card = { identity_summary: content, prompt_version: "v1" };
    }

    return new Response(JSON.stringify({ card }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("generate-onboarding-card error:", error);
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
