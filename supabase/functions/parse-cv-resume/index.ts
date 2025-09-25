import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface CVAnalysisRequest {
  imageDataUrls: string[]; // Array of base64 data URLs from client
  fileName: string;
  userId: string;
}

interface ExtractionPrompt {
  personalInfo: {
    name?: string;
    title?: string;
    summary?: string;
    email?: string;
    phone?: string;
  };
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { imageDataUrls, fileName, userId }: CVAnalysisRequest = await req.json();
    
    if (!imageDataUrls || imageDataUrls.length === 0 || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing CV vision analysis for user: ${userId}, file: ${fileName}, ${imageDataUrls.length} images`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare image content for OpenAI Vision
    const imageContent = imageDataUrls.map(dataUrl => ({
      type: "image_url" as const,
      image_url: {
        url: dataUrl,
        detail: "high" as const
      }
    }));

    const systemPrompt = `You are a professional CV/Resume parser that extracts structured data from images.
Extract information accurately from the CV/resume images provided. Return ONLY valid JSON matching this exact schema:

{
  "personalInfo": {
    "name": "Full name from CV",
    "title": "Professional title/current role",
    "summary": "Professional summary if present (2-3 sentences max)",
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
- Extract exact text, don't invent information`;

    const userPrompt = `Please analyze this CV/resume and extract all relevant information. Return only the JSON structure with the extracted data.`;

    // Call OpenAI Vision API
    const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Use gpt-4o for vision capabilities
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { 
            role: 'user', 
            content: [
              { type: "text", text: userPrompt },
              ...imageContent
            ]
          }
        ],
        max_tokens: 3000,
        temperature: 0.1,
        response_format: { type: "json_object" }
      }),
    });

    if (!extractionResponse.ok) {
      const errorText = await extractionResponse.text();
      console.error(`OpenAI API error: ${extractionResponse.status} - ${errorText}`);
      throw new Error(`OpenAI Vision API error: ${extractionResponse.statusText}`);
    }

    const extractionData = await extractionResponse.json();
    console.log('OpenAI Vision extraction response:', JSON.stringify(extractionData, null, 2));

    // Parse the OpenAI response
    let extractedDataFromAI: ExtractionPrompt | null = null;
    try {
      if (extractionData.choices && extractionData.choices[0]?.message?.content) {
        const content = extractionData.choices[0].message.content;
        extractedDataFromAI = JSON.parse(content);
        console.log('Successfully parsed CV data from OpenAI Vision');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI Vision response:', parseError);
      console.log('Raw response:', extractionData.choices?.[0]?.message?.content);
    }

    // Use AI data or throw error if parsing failed
    if (!extractedDataFromAI) {
      throw new Error('Failed to extract data from CV');
    }
    
    const extractedData: ExtractionPrompt = extractedDataFromAI;

    // Get user's existing profile data for cross-referencing
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: userAnswers } = await supabase
      .from('user_answers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Generate suggestions based on extracted data and existing profile
    const existingSkills = userProfile?.skills || [];
    const skillMatches = extractedData.skills.filter(skill => 
      existingSkills.some((existing: string) => 
        existing.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(existing.toLowerCase())
      )
    );

    // Generate dynamic gap analysis based on user profile and CV
    const mismatchWarnings = [];
    const gapAnalysis = [];
    const improvements = [];
    
    // Compare CV data with user answers/goals
    if (userAnswers) {
      const userCareerGoal = userAnswers.career_path || userAnswers.desired_outcome;
      const cvTitle = extractedData.personalInfo?.title?.toLowerCase();
      
      if (userCareerGoal && cvTitle && !cvTitle.includes(userCareerGoal.toLowerCase()) && !userCareerGoal.toLowerCase().includes(cvTitle)) {
        mismatchWarnings.push(`CV shows "${extractedData.personalInfo?.title}" but your career goal is "${userCareerGoal}"`);
      }
      
      // Check academic status vs experience level
      const academicStatus = userAnswers.onboarding_inputs?.academic_status;
      if (academicStatus === 'student' && extractedData.experience.length > 2) {
        mismatchWarnings.push('CV shows extensive work experience but you selected "student" status');
      }

      // Generate dynamic gap analysis based on career goals
      if (userCareerGoal?.toLowerCase().includes('software') || userCareerGoal?.toLowerCase().includes('developer')) {
        if (!extractedData.skills.some(skill => skill.toLowerCase().includes('cloud'))) {
          gapAnalysis.push('Cloud platforms (AWS/Azure/GCP) missing - essential for modern development roles');
        }
        if (!extractedData.skills.some(skill => skill.toLowerCase().includes('docker') || skill.toLowerCase().includes('kubernetes'))) {
          gapAnalysis.push('Container technologies (Docker/Kubernetes) could strengthen your profile');
        }
      }
      
      if (userCareerGoal?.toLowerCase().includes('data') || userCareerGoal?.toLowerCase().includes('analyst')) {
        if (!extractedData.skills.some(skill => skill.toLowerCase().includes('python') || skill.toLowerCase().includes('sql'))) {
          gapAnalysis.push('Data analysis tools (Python/SQL) are expected for data roles');
        }
      }
    }

    // Analyze content for improvement opportunities
    const experienceTexts = extractedData.experience.map(exp => exp.description.toLowerCase()).join(' ');
    
    if (experienceTexts.includes('responsible for')) {
      improvements.push('Replace "responsible for" with stronger action verbs like "spearheaded", "orchestrated", or "delivered"');
    }
    
    // Check for lack of quantified achievements
    const hasNumbers = /\d+/.test(experienceTexts);
    if (!hasNumbers) {
      improvements.push('Add specific metrics and KPIs to show measurable impact (e.g., "increased efficiency by 25%")');
    }
    
    // Check for generic descriptions
    if (experienceTexts.includes('worked on') || experienceTexts.includes('helped with')) {
      improvements.push('Use specific language - replace "worked on" with "developed", "implemented", or "optimized"');
    }
    
    // Ensure we have at least one improvement suggestion
    if (improvements.length === 0) {
      improvements.push('Consider adding more specific technical details about tools and technologies used in each role');
    }

    // Store CV metadata in user profile
    const cvMetadata = {
      originalFileName: fileName,
      uploadedAt: new Date().toISOString(),
      extractionConfidence: 85,
      sectionsFound: ['personalInfo', 'skills', 'experience', 'education']
    };

    await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        cv_imported_at: new Date().toISOString(),
        cv_source_metadata: cvMetadata,
        cv_last_used: new Date().toISOString()
      });

    // Return structured analysis results
    const analysisResult = {
      extractedData: extractedData,
      suggestions: {
        skillMatches: skillMatches.slice(0, 5),
        gapAnalysis,
        improvements,
        mismatchWarnings,
        confidence: 85
      },
      metadata: cvMetadata
    };

    console.log(`CV analysis completed for user: ${userId}`);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-cv-resume function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to parse CV', 
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});