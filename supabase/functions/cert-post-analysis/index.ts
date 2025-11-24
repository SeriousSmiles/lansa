import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface PostExamAIRequest {
  sector: 'office' | 'service' | 'technical' | 'digital';
  category_scores: {
    mindset: number;
    workplace_intelligence: number;
    performance_habits: number;
    applied_thinking: number;
  };
  total_score: number;
  pass_fail: 'PASS' | 'NEEDS_IMPROVEMENT';
  answers: Array<{
    question_id: string;
    scenario: string;
    category: string;
    selected_text: string;
    points_awarded: number;
  }>;
}

interface PostExamAIResponse {
  strengths: string[];
  focus_areas: string[];
  per_question_reflections: Array<{
    question_id: string;
    short_mirror: string;
    points: number;
    category: string;
  }>;
  category_cards: Array<{
    category: string;
    summary: string;
    next_step: string;
  }>;
  mini_report: {
    overall: string;
    categories: string;
    forward: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const requestBody: PostExamAIRequest = await req.json();
    const { sector, category_scores, total_score, pass_fail, answers } = requestBody;

    console.log(`Processing post-exam analysis for ${sector} sector, score: ${total_score}%, status: ${pass_fail}`);

    // Build system prompt with score-aware instructions
    const systemPrompt = `You are the Lansa Reflection AI for end-of-exam professional readiness reports.

SCORING PHILOSOPHY:
- 8-10 points: HIGH SCORE → Positive reinforcement, celebrate the choice
- 5-7 points: MEDIUM SCORE → Mixed feedback (acknowledge what works + 1 specific improvement)
- 2-4 points: LOW SCORE → Honest critique + 1 actionable mindset shift

TASK BREAKDOWN:

1. PER-QUESTION REFLECTIONS (for all ${answers.length} questions):
   For each answer, write 1-2 sentences that:
   - Match the score bucket (positive for 8-10, mixed for 5-7, honest critique for 2-4)
   - Reference the category (mindset/workplace_intelligence/performance_habits/applied_thinking)
   - Use Caribbean-professional tone (direct, warm, growth-minded)

2. CATEGORY CARDS (4 cards, one per category):
   For each category:
   - Write 2-3 sentence summary of performance in that category
   - Write 1 clear "next_step" action item (short, actionable phrase)

3. STRENGTHS & FOCUS AREAS:
   - Extract 3-6 strengths from high-scoring patterns (single words or short phrases)
   - Extract 2-4 focus areas from low-scoring patterns (single words or short phrases)
   - Examples: "Accountability", "Clear communication", "Expectation management"

4. MINI REPORT (3 paragraphs):
   - Paragraph 1 (overall): Overall professional readiness impression
   - Paragraph 2 (categories): Category perspective (strongest area + growth area)
   - Paragraph 3 (forward): Forward-looking statement for employers

Context:
- Sector: ${sector}
- Total Score: ${total_score}%
- Pass/Fail: ${pass_fail}
- Category Scores:
  * Mindset: ${category_scores.mindset}%
  * Workplace Intelligence: ${category_scores.workplace_intelligence}%
  * Performance Habits: ${category_scores.performance_habits}%
  * Applied Thinking: ${category_scores.applied_thinking}%

Return ONLY valid JSON matching this exact schema:
{
  "strengths": ["strength1", "strength2", ...],
  "focus_areas": ["area1", "area2", ...],
  "per_question_reflections": [
    {
      "question_id": "uuid",
      "short_mirror": "1-2 sentence reflection",
      "points": 7,
      "category": "mindset"
    }
  ],
  "category_cards": [
    {
      "category": "mindset",
      "summary": "2-3 sentence summary",
      "next_step": "Clear action item"
    }
  ],
  "mini_report": {
    "overall": "Paragraph 1",
    "categories": "Paragraph 2",
    "forward": "Paragraph 3"
  }
}

Tone: Caribbean-professional, direct, growth-minded, honest but encouraging.
Be specific and actionable in all feedback.`;

    // Build user message with all answers
    const userMessage = `Generate comprehensive post-exam analysis.

ANSWERS (${answers.length} questions):
${answers.map((a, i) => `
Question ${i + 1} [${a.category}]:
Scenario: "${a.scenario}"
User's answer: "${a.selected_text}"
Points: ${a.points_awarded}/10
`).join('\n')}

Analyze patterns across all answers and provide structured feedback.`;

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      // Handle rate limit (429) and credit issues (402)
      if (response.status === 429) {
        throw new Error('AI service temporarily unavailable. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI credits exhausted. Please contact support.');
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;
    
    console.log('AI response received, parsing JSON...');
    
    let analysisResult: PostExamAIResponse;
    try {
      analysisResult = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('AI returned invalid response format');
    }

    // Validate structure
    if (!analysisResult.strengths || !analysisResult.focus_areas || 
        !analysisResult.per_question_reflections || !analysisResult.category_cards || 
        !analysisResult.mini_report) {
      console.error('Invalid analysis structure:', analysisResult);
      throw new Error('AI response missing required fields');
    }

    console.log(`Analysis complete: ${analysisResult.strengths.length} strengths, ${analysisResult.focus_areas.length} focus areas, ${analysisResult.per_question_reflections.length} reflections`);

    return new Response(
      JSON.stringify(analysisResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in cert-post-analysis function:', error);

    // Return fallback response to ensure exam can complete
    const fallbackResponse: PostExamAIResponse = {
      strengths: ['Problem-solving', 'Professional awareness', 'Growth mindset'],
      focus_areas: ['Continue developing workplace skills', 'Practice decision-making'],
      per_question_reflections: [],
      category_cards: [
        {
          category: 'mindset',
          summary: 'Your mindset performance shows promise. Continue developing accountability and ownership in workplace situations.',
          next_step: 'Practice owning outcomes'
        },
        {
          category: 'workplace_intelligence',
          summary: 'You demonstrate awareness of workplace dynamics. Focus on reading situations and adapting your approach.',
          next_step: 'Ask clarifying questions'
        },
        {
          category: 'performance_habits',
          summary: 'Your performance habits show potential. Continue building consistency and follow-through.',
          next_step: 'Track your commitments'
        },
        {
          category: 'applied_thinking',
          summary: 'Your problem-solving approach is developing. Focus on breaking down complex situations.',
          next_step: 'Practice solution-focused thinking'
        }
      ],
      mini_report: {
        overall: 'You demonstrate foundational professional readiness and awareness of workplace expectations. Your responses show potential and a willingness to learn.',
        categories: 'Your strongest areas show promise for growth. Focus on developing consistency across all workplace fundamentals.',
        forward: 'This certification signals a candidate who is developing professional maturity and readiness for workplace environments. Continue building on these foundations.'
      }
    };

    return new Response(
      JSON.stringify({
        ...fallbackResponse,
        error: error.message,
        fallback: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
