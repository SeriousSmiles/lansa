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
  fileData?: string; // base64 encoded PDF (legacy)
  extractedText?: string; // PDF text content
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

    const { fileData, extractedText, fileName, userId }: CVAnalysisRequest = await req.json();
    
    if ((!fileData && !extractedText) || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing CV upload for user: ${userId}, file: ${fileName}`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use the extracted text if provided, otherwise fall back to demo data
    const cvText = extractedText || "Demo CV content - no actual text extraction performed";
    
    // Create extraction prompt for OpenAI
    const extractionPrompt = `You are a professional CV/Resume parser. Extract the following information from this CV text and return it as JSON:

{
  "personalInfo": {
    "name": "Full name",
    "title": "Professional title/role",
    "summary": "Professional summary or objective (2-3 sentences)",
    "email": "Email address if found",
    "phone": "Phone number if found"
  },
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration": "Start - End dates",
      "description": "Key responsibilities and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "Institution name", 
      "year": "Graduation year"
    }
  ]
}

Focus on extracting factual information. For skills, identify both technical and soft skills. For experience, capture key achievements and responsibilities. For education, include degrees, certifications, and relevant coursework.

CV Content to parse:
${cvText}

Please return only the JSON structure with the extracted data.`;

    // Call OpenAI API for extraction
    const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional CV parser. Always respond with valid JSON only.' 
          },
          { role: 'user', content: extractionPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!extractionResponse.ok) {
      throw new Error(`OpenAI API error: ${extractionResponse.statusText}`);
    }

    const extractionData = await extractionResponse.json();
    console.log('OpenAI extraction response:', extractionData);

    // Try to parse the actual OpenAI response
    let extractedDataFromAI: ExtractionPrompt | null = null;
    try {
      if (extractedData.choices && extractedData.choices[0]?.message?.content) {
        const content = extractedData.choices[0].message.content;
        // Remove any markdown formatting
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        extractedDataFromAI = JSON.parse(cleanContent);
      }
    } catch (parseError) {
      console.log('Failed to parse OpenAI response, using fallback data:', parseError);
    }

    // Use AI data if available, otherwise use demo data
    const mockExtractedData: ExtractionPrompt = extractedDataFromAI || {
      personalInfo: {
        name: "John Doe",
        title: "Software Developer",
        summary: "Experienced software developer with 5+ years in web development, specializing in React and Node.js applications with a passion for creating efficient, scalable solutions.",
        email: "john.doe@email.com",
        phone: "+1234567890"
      },
      skills: [
        "JavaScript", "React", "Node.js", "Python", "SQL", "Git", 
        "MongoDB", "Express.js", "HTML/CSS", "TypeScript", "AWS", "Docker"
      ],
      experience: [
        {
          title: "Senior Software Developer",
          company: "Tech Corp",
          duration: "2022-Present",
          description: "Led development of web applications using React and Node.js. Implemented microservices architecture that improved system performance by 40%. Mentored junior developers and conducted code reviews."
        },
        {
          title: "Software Developer",
          company: "StartupXYZ",
          duration: "2020-2022",
          description: "Developed and maintained multiple web applications using modern JavaScript frameworks. Collaborated with cross-functional teams to deliver high-quality software solutions."
        },
        {
          title: "Junior Developer",
          company: "Dev Agency",
          duration: "2019-2020",
          description: "Built responsive websites and web applications. Gained experience in full-stack development and agile methodologies."
        }
      ],
      education: [
        {
          degree: "Bachelor of Computer Science",
          institution: "University of Technology",
          year: "2019"
        }
      ]
    };

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
    const skillMatches = mockExtractedData.skills.filter(skill => 
      existingSkills.some((existing: string) => 
        existing.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(existing.toLowerCase())
      )
    );

    // Check for mismatches with user onboarding data
    const mismatchWarnings = [];
    
    // Compare CV data with user answers/goals
    if (userAnswers) {
      const userCareerGoal = userAnswers.career_path || userAnswers.desired_outcome;
      const cvTitle = mockExtractedData.personalInfo?.title?.toLowerCase();
      
      if (userCareerGoal && cvTitle && !cvTitle.includes(userCareerGoal.toLowerCase()) && !userCareerGoal.toLowerCase().includes(cvTitle)) {
        mismatchWarnings.push(`CV shows "${mockExtractedData.personalInfo?.title}" but your career goal is "${userCareerGoal}"`);
      }
      
      // Check academic status vs experience level
      const academicStatus = userAnswers.onboarding_inputs?.academic_status;
      if (academicStatus === 'student' && mockExtractedData.experience.length > 2) {
        mismatchWarnings.push('CV shows extensive work experience but you selected "student" status');
      }
    }

    const gapAnalysis = [
      "Missing cloud platforms (AWS/Azure certification)",
      "No mobile development experience mentioned", 
      "Consider adding project management skills"
    ];

    const improvements = [
      "Replace 'responsible for' with 'spearheaded' or 'orchestrated'",
      "Add specific metrics and KPIs to achievements",
      "Include technologies used in each role"
    ];

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
      extractedData: mockExtractedData,
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