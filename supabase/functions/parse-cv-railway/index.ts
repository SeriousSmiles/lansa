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
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    if (!file || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing file or userId parameter' }), 
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
      railwayFormData.append('file', file);

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

      // Extract and structure the data from Railway response with source tracking
      const extractedData = {
        personalInfo: {
          name: railwayData.personal_info?.name || railwayData.name,
          title: railwayData.personal_info?.title || railwayData.title,
          summary: railwayData.personal_info?.summary || railwayData.summary,
          email: railwayData.personal_info?.email || railwayData.contact?.email,
          phone: railwayData.personal_info?.phone || railwayData.contact?.phone,
          location: railwayData.personal_info?.location || railwayData.contact?.location || railwayData.location,
        },
        skills: railwayData.skills || [],
        experience: (railwayData.experience || railwayData.work_experience || []).map((exp: any, index: number) => ({
          title: exp.title || exp.job_title || exp.position,
          company: exp.company || exp.employer,
          duration: exp.duration || `${exp.start_date || ''} - ${exp.end_date || 'Present'}`,
          description: exp.description || exp.responsibilities || '',
          source: 'resume-upload',
          order_index: index,
          is_user_edited: false
        })),
        education: (railwayData.education || []).map((edu: any, index: number) => ({
          degree: edu.degree || edu.qualification,
          institution: edu.institution || edu.school || edu.university,
          year: edu.year || edu.graduation_year || edu.end_date || '',
          source: 'resume-upload',
          order_index: index,
          is_user_edited: false
        }))
      };

      // Calculate confidence scores based on Railway response
      const confidenceScores = {
        overall: railwayData.confidence || 0.85,
        personalInfo: railwayData.confidence_scores?.personal_info || 0.9,
        skills: railwayData.confidence_scores?.skills || 0.8,
        experience: railwayData.confidence_scores?.experience || 0.85,
        education: railwayData.confidence_scores?.education || 0.8
      };

      // Determine sections found
      const sectionsFound = [];
      if (extractedData.personalInfo.name || extractedData.personalInfo.email) sectionsFound.push('personal_info');
      if (extractedData.skills.length > 0) sectionsFound.push('skills');
      if (extractedData.experience.length > 0) sectionsFound.push('experience');
      if (extractedData.education.length > 0) sectionsFound.push('education');

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

      // Generate suggestions based on extracted data
      const suggestions = {
        skillMatches: extractedData.skills.slice(0, 5),
        gapAnalysis: [
          "Consider adding cloud platforms (AWS/Azure) to your skillset",
          "Mobile development experience could enhance your profile",
          "Project management certifications would be valuable"
        ],
        improvements: [
          "Use stronger action verbs like 'orchestrated' or 'spearheaded'",
          "Include specific metrics and quantifiable achievements",
          "Add technical stack details for each role"
        ],
        confidence: confidenceScores.overall * 100
      };

      const analysisResult = {
        id: resumeRecord.id,
        extractedData,
        suggestions,
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

    } catch (processingError) {
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

  } catch (error) {
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