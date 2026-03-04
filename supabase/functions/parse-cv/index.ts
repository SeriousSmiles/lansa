import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
    // Ownership validation: verify the caller owns the userId they're submitting
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuthClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuthClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { imageDataUrls, fileName, userId } = await req.json();

    // Ensure caller can only parse CV for their own account
    if (claimsData.claims.sub !== userId) {
      return new Response(
        JSON.stringify({ error: "Forbidden: can only parse CV for your own account" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Guard: reject payloads that are too large (> 4MB base64 total)
    const totalSize = (imageDataUrls ?? []).reduce((sum: number, url: string) => sum + url.length, 0);
    if (totalSize > 4_000_000) {
      return new Response(
        JSON.stringify({ error: "CV file is too large to process. Please try a smaller file or fewer pages." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!imageDataUrls || imageDataUrls.length === 0 || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(
      `Processing CV for user: ${userId}, file: ${fileName}, ${imageDataUrls.length} image(s)`
    );

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build vision content array
    const imageContent = imageDataUrls.map((dataUrl: string) => ({
      type: "image_url" as const,
      image_url: { url: dataUrl, detail: "high" as const },
    }));

    const systemPrompt = `You are a professional CV/Resume parser that extracts structured data from images.
Extract information accurately from the CV/resume images provided. Return ONLY valid JSON matching this exact schema:

{
  "personalInfo": {
    "name": "Full name from CV",
    "title": "Professional title/current role",
    "summary": "The candidate's personal/professional bio paragraph. This section goes by many names: 'Profile', 'About Me', 'Bio', 'Summary', 'Personal Statement', 'Objective', 'Introduction', 'Professional Summary', 'Career Summary', 'Personal Profile', or similar. Extract the full text of this paragraph — it is the section where the candidate describes themselves in their own words. Do NOT invent one if none exists.",
    "email": "Email address if visible",
    "phone": "Phone number if visible"
  },
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration": "Start date - End date (or Present)",
      "description": "Key responsibilities and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree type and name",
      "institution": "School/University name",
      "year": "Graduation year"
    }
  ]
}

Focus on:
- Technical and soft skills mentioned
- Work experience with specific achievements
- Education and certifications
- Contact information if visible
- The personal bio/profile paragraph (look for ANY free-text section describing the person, regardless of its heading name)
- Extract exact text, don't invent information`;

    // Call Lovable AI gateway (Gemini 2.5 Flash — vision-capable)
    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Please analyze this CV/resume and extract all relevant information. Return only the JSON structure with the extracted data.",
                },
                ...imageContent,
              ],
            },
          ],
          temperature: 0.1,
        }),
      }
    );

    // Surface rate-limit / credit errors to the client
    if (aiResponse.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (aiResponse.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Please top up your workspace credits." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error(`AI gateway error ${aiResponse.status}:`, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    let rawContent = aiData.choices?.[0]?.message?.content ?? "";

    // Strip markdown code fences if present
    rawContent = rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let extractedData;
    try {
      extractedData = JSON.parse(rawContent);
    } catch {
      console.error("Failed to parse AI response as JSON:", rawContent);
      throw new Error("AI returned invalid JSON");
    }

    console.log("CV extraction successful");

    // --- Cross-reference with existing profile for suggestions ---
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("*, professional_stage")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: userAnswers } = await supabase
      .from("user_answers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const existingSkills: string[] = Array.isArray(userProfile?.skills)
      ? userProfile.skills
      : [];
    const skillMatches = (extractedData.skills ?? []).filter((s: string) =>
      existingSkills.some(
        (e: string) =>
          e.toLowerCase().includes(s.toLowerCase()) ||
          s.toLowerCase().includes(e.toLowerCase())
      )
    );

    const mismatchWarnings: string[] = [];
    const gapAnalysis: string[] = [];
    const improvements: string[] = [];

    const professionalStage = userProfile?.professional_stage;

    if (userAnswers) {
      const userCareerGoal =
        userAnswers.career_path || userAnswers.desired_outcome;
      const cvTitle = extractedData.personalInfo?.title?.toLowerCase();

      // Only warn about career goal mismatch if both exist and are meaningfully different
      if (
        userCareerGoal &&
        cvTitle &&
        !cvTitle.includes(userCareerGoal.toLowerCase()) &&
        !userCareerGoal.toLowerCase().includes(cvTitle)
      ) {
        if (professionalStage === 'working_professional') {
          mismatchWarnings.push(
            `Your CV title "${extractedData.personalInfo?.title}" differs from your stated career goal "${userCareerGoal}". Consider aligning them.`
          );
        } else if (professionalStage === 'student') {
          mismatchWarnings.push(
            `CV shows "${extractedData.personalInfo?.title}" — make sure this aligns with your career intention as a student.`
          );
        }
      }

      // Only warn about extensive experience for actual students
      if (
        professionalStage === "student" &&
        (extractedData.experience?.length ?? 0) > 2
      ) {
        mismatchWarnings.push(
          'Your CV shows extensive work experience but you selected "Student" status. If you\'re now working, consider updating your professional stage.'
        );
      }

      if (
        userCareerGoal?.toLowerCase().includes("software") ||
        userCareerGoal?.toLowerCase().includes("developer")
      ) {
        if (
          !(extractedData.skills ?? []).some((s: string) =>
            s.toLowerCase().includes("cloud")
          )
        ) {
          gapAnalysis.push(
            "Cloud platforms (AWS/Azure/GCP) missing – essential for modern dev roles"
          );
        }
      }
    }

    const expText = (extractedData.experience ?? [])
      .map((e: { description: string }) => e.description.toLowerCase())
      .join(" ");

    if (expText.includes("responsible for")) {
      improvements.push(
        'Replace "responsible for" with stronger action verbs like "spearheaded" or "delivered"'
      );
    }
    if (!/\d+/.test(expText)) {
      improvements.push(
        'Add specific metrics to show measurable impact (e.g., "increased efficiency by 25%")'
      );
    }
    if (improvements.length === 0) {
      improvements.push(
        "Consider adding more specific technical details about tools used in each role"
      );
    }

    // Store metadata in user profile
    const cvMetadata = {
      originalFileName: fileName,
      uploadedAt: new Date().toISOString(),
      extractionConfidence: 85,
      sectionsFound: ["personalInfo", "skills", "experience", "education"],
      parsingSource: "lovable-ai",
    };

    await supabase.from("user_profiles").upsert({
      user_id: userId,
      cv_imported_at: new Date().toISOString(),
      cv_source_metadata: cvMetadata,
      cv_last_used: new Date().toISOString(),
    });

    const analysisResult = {
      extractedData,
      suggestions: {
        skillMatches: skillMatches.slice(0, 5),
        gapAnalysis,
        improvements,
        mismatchWarnings,
        confidence: 85,
      },
      metadata: cvMetadata,
    };

    console.log(`CV analysis completed for user: ${userId}`);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in parse-cv function:", message);
    return new Response(
      JSON.stringify({ error: "Failed to parse CV", details: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
