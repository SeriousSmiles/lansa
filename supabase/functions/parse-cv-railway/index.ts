import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const railwayUrl = 'https://mcb-ai-parser-1-production.up.railway.app/upload';

interface RailwayParseRequest {
  file: File;
  fileName: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File;
    const userId = formData.get('userId') as string;
    
    if (!file || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing pdf file or userId parameter' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing CV via Railway for user: ${userId}, file: ${file.name}, size: ${file.size} bytes`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create initial resume record
    const { data: resumeRecord, error: insertError } = await supabase
      .from('user_resumes')
      .insert({
        user_id: userId,
        original_filename: file.name,
        file_size: file.size,
        processing_status: 'processing',
        parsing_source: 'railway'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating resume record:', insertError);
      throw new Error('Failed to create resume record');
    }

    try {
      // Prepare FormData for Railway microservice
      const railwayFormData = new FormData();
      railwayFormData.append('pdf', file);

      console.log('Sending file to Railway microservice...');

      // Send file to Railway microservice
      const railwayResponse = await fetch(railwayUrl, {
        method: 'POST',
        body: railwayFormData,
      });

      if (!railwayResponse.ok) {
        const errorText = await railwayResponse.text();
        console.error(`Railway microservice error: ${railwayResponse.status} - ${errorText}`);
        throw new Error(`Railway parsing failed: ${railwayResponse.statusText}`);
      }

      const railwayData = await railwayResponse.json();
      console.log('Railway microservice response received');

      // Normalize Railway response with better field extraction
      let normalized: any = { personalInfo: {}, skills: [], experience: [], education: [] };

      if (Array.isArray(railwayData.extracted) && railwayData.extracted.length > 0) {
        const first = railwayData.extracted[0]; // if multi-page, you can merge instead

        // Extract personal info with fallbacks and better validation
        normalized.personalInfo = {
          name: first.full_name || first.name || null,
          title: first.title || first.job_title || first.position || null,
          summary: first.summary || first.profile_summary || first.objective || null,
          email: first.contact?.email || first.email || null,
          phone: first.contact?.phone || first.phone || first.contact?.phone_number || null,
          location: first.location || first.address || first.contact?.address || null,
        };

        // Extract skills with better handling
        normalized.skills = first.skills || first.technical_skills || first.skill_list || [];

        // Extract experience with better field mapping
        const workExperience = first.work_experience || first.experience || first.employment || [];
        normalized.experience = workExperience.map((exp: any, index: number) => ({
          title: exp.title || exp.position || exp.job_title || 'Unknown Position',
          company: exp.company || exp.employer || exp.organization || 'Unknown Company',
          duration: exp.duration || exp.dates || exp.period || 'Unknown Period',
          description: exp.description || exp.responsibilities || exp.duties || 'No description provided',
          source: 'resume-upload',
          order_index: index,
          is_user_edited: false
        }));

        // Extract education with better field mapping
        const educationData = first.education || first.academic_background || first.qualifications || [];
        normalized.education = educationData.map((edu: any, index: number) => ({
          degree: edu.degree || edu.qualification || edu.program || 'Unknown Degree',
          institution: edu.school || edu.university || edu.institution || edu.college || 'Unknown Institution',
          year: edu.year || edu.graduation_year || edu.end_date || 'Unknown Year',
          source: 'resume-upload',
          order_index: index,
          is_user_edited: false
        }));
      } else {
        console.warn("Railway response missing or empty, raw:", JSON.stringify(railwayData, null, 2));
        
        // If Railway fails, try to extract basic info from any available fields
        if (railwayData && typeof railwayData === 'object') {
          normalized.personalInfo = {
            name: railwayData.name || railwayData.full_name || null,
            title: railwayData.title || railwayData.position || null,
            summary: railwayData.summary || null,
            email: railwayData.email || null,
            phone: railwayData.phone || null,
          };
          normalized.skills = railwayData.skills || [];
          normalized.experience = railwayData.experience || [];
          normalized.education = railwayData.education || [];
        }
      }

      // Check what was actually found
      const sectionsFound: string[] = [];
      if (normalized.personalInfo.name || normalized.personalInfo.email) sectionsFound.push("personalInfo");
      if (normalized.skills.length > 0) sectionsFound.push("skills");
      if (normalized.experience.length > 0) sectionsFound.push("experience");
      if (normalized.education.length > 0) sectionsFound.push("education");

      // Compare name with user profile
      const { data: userProfileForNameCheck } = await supabase
        .from('user_profiles')
        .select('name')
        .eq('user_id', userId)
        .maybeSingle();

      let nameWarning: string | null = null;
      if (userProfileForNameCheck?.name && normalized.personalInfo.name &&
          normalized.personalInfo.name.toLowerCase() !== userProfileForNameCheck.name.toLowerCase()) {
        nameWarning = `Uploaded CV shows "${normalized.personalInfo.name}" but your profile is "${userProfileForNameCheck.name}". Do you want to continue?`;
      }

      const extractedData = normalized;

      // Calculate confidence scores based on Railway response
      const confidenceScores = {
        overall: railwayData.confidence || 0.85,
        personalInfo: railwayData.confidence_scores?.personal_info || 0.9,
        skills: railwayData.confidence_scores?.skills || 0.8,
        experience: railwayData.confidence_scores?.experience || 0.85,
        education: railwayData.confidence_scores?.education || 0.8
      };

      // Update resume record with parsed data
      const { error: updateError } = await supabase
        .from('user_resumes')
        .update({
          processing_status: 'completed',
          extracted_data: extractedData,
          raw_response: railwayData,
          confidence_scores: confidenceScores,
          sections_found: sectionsFound,
          processed_at: new Date().toISOString()
        })
        .eq('id', resumeRecord.id);

      if (updateError) {
        console.error('Error updating resume record:', updateError);
        throw new Error('Failed to update resume record');
      }

      // Fetch user context for dynamic analysis
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

      // Generate dynamic suggestions based on extracted data and user context
      const skillMatches = extractedData.skills.filter((skill: string) => 
        userProfile?.skills?.some((existing: string) => 
          existing.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(existing.toLowerCase())
        )
      ).slice(0, 5);

      // Dynamic gap analysis based on career goals
      const gapAnalysis = [];
      const userCareerGoal = userAnswers?.career_path || userAnswers?.desired_outcome;
      
      if (userCareerGoal?.toLowerCase().includes('software') || userCareerGoal?.toLowerCase().includes('developer')) {
        if (!extractedData.skills.some((skill: string) => skill.toLowerCase().includes('cloud'))) {
          gapAnalysis.push('Cloud platforms (AWS/Azure/GCP) - critical for modern development roles');
        }
        if (!extractedData.skills.some((skill: string) => skill.toLowerCase().includes('react') || skill.toLowerCase().includes('vue'))) {
          gapAnalysis.push('Modern frontend frameworks (React/Vue) could strengthen your profile');
        }
      } else if (userCareerGoal?.toLowerCase().includes('data')) {
        if (!extractedData.skills.some((skill: string) => skill.toLowerCase().includes('python') || skill.toLowerCase().includes('sql'))) {
          gapAnalysis.push('Data analysis tools (Python/SQL/R) are essential for data roles');
        }
      } else {
        gapAnalysis.push('Digital literacy skills could enhance your profile across industries');
      }

      // Dynamic improvements based on actual content
      const improvements = [];
      const experienceTexts = extractedData.experience.map((exp: any) => exp.description.toLowerCase()).join(' ');
      
      if (experienceTexts.includes('responsible for')) {
        improvements.push('Replace "responsible for" with impact-focused verbs like "delivered", "optimized", or "transformed"');
      }
      
      const hasMetrics = /\d+%|\d+\s*(increase|decrease|growth|improvement)/.test(experienceTexts);
      if (!hasMetrics) {
        improvements.push('Add quantifiable achievements - recruiters want to see measurable impact');
      }
      
      if (improvements.length === 0) {
        improvements.push('Consider highlighting specific technologies and methodologies used in each role');
      }

      const suggestions = {
        skillMatches: skillMatches.length > 0 ? skillMatches : extractedData.skills.slice(0, 3),
        gapAnalysis,
        improvements,
        confidence: confidenceScores.overall * 100
      };

      const analysisResult = {
        id: resumeRecord.id,
        extractedData,
        suggestions,
        nameWarning,
        metadata: {
          originalFileName: file.name,
          uploadedAt: resumeRecord.created_at,
          extractionConfidence: confidenceScores.overall,
          sectionsFound,
          processingSource: 'railway'
        }
      };

      console.log(`Railway CV analysis completed for user: ${userId}`);

      return new Response(JSON.stringify(analysisResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (processingError: any) {
      console.error('Error during CV processing:', processingError);
      
      // Update resume record with error status
      await supabase
        .from('user_resumes')
        .update({
          processing_status: 'failed',
          error_message: processingError.message,
          processed_at: new Date().toISOString()
        })
        .eq('id', resumeRecord.id);

      throw processingError;
    }

  } catch (error: any) {
    console.error('Error in parse-cv-railway function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to parse CV via Railway', 
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});