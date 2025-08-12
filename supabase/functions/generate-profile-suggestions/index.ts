import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SuggestionExperience = {
  title: string;
  description: string;
  startYear?: number;
  endYear?: number | null;
};

type SuggestionEducation = {
  title: string;
  description: string;
  startYear?: number;
  endYear?: number | null;
};

type Suggestions = {
  title: string;
  about: string;
  skills: string[];
  experiences: SuggestionExperience[];
  education: SuggestionEducation[];
  prompt_version: string;
};

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

    const system = `You are a precise profile-coach assistant. Generate practical suggestions to populate a user's professional profile.
- Output STRICT JSON (no markdown), following this exact schema:
{
  "title": string,                   // a concise, role-aligned headline (max ~10 words)
  "about": string,                   // a short paragraph (3-5 sentences) in first-person
  "skills": string[],                // 5-8 concrete, resume-appropriate skills
  "experiences": [                   // 1-2 relevant experiences with short, impact-focused descriptions
    { "title": string, "description": string, "startYear": number, "endYear": number|null }
  ],
  "education": [                     // 1-2 relevant education items
    { "title": string, "description": string, "startYear": number, "endYear": number|null }
  ],
  "prompt_version": "v1"
}
- Keep tone professional, human, and specific to the user's answers.
- If information is missing, infer plausible, generic-yet-helpful content without being fictional about employers or schools (use role-generic placeholders).`;

    const userText = Object.entries(answers || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const body = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userText || "User provided minimal info. Provide sane defaults." },
      ],
      temperature: 0.5,
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

    let suggestions: Suggestions;
    try {
      suggestions = typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      suggestions = {
        title: "Professional Headline",
        about: "I'm a dedicated professional focused on delivering high-quality outcomes.",
        skills: ["Communication", "Problem Solving", "Project Management", "Collaboration", "Adaptability"],
        experiences: [
          { title: "Relevant Experience", description: "Contributed to impactful projects.", startYear: 2022, endYear: null },
        ],
        education: [
          { title: "Relevant Education", description: "Completed courses relevant to my field.", startYear: 2020, endYear: 2022 },
        ],
        prompt_version: "v1",
      };
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("generate-profile-suggestions error:", error);
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
