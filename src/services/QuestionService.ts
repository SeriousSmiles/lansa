import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface OnboardingQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface UserAnswers {
  question1?: string;
  question2?: string;
  question3?: string;
  gender?: string;
  age_group?: string;
  identity?: string;
  desired_outcome?: string;
}

// Define all questions across steps
export const demographicsQuestions: OnboardingQuestion[] = [
  {
    id: "gender",
    question: "What's your gender?",
    options: [
      "Male",
      "Female",
      "Prefer not to say",
      "Prefer to self-describe"
    ]
  },
  {
    id: "age_group",
    question: "What's your age range?",
    options: [
      "Under 18",
      "18–24",
      "25–34",
      "35–44",
      "45–54",
      "55+"
    ]
  }
];

export const identityQuestions: OnboardingQuestion[] = [
  {
    id: "identity",
    question: "Which of these describes how you see yourself professionally?",
    options: [
      "Freelancer",
      "Job-seeker",
      "Student",
      "Entrepreneur",
      "Visionary"
    ]
  }
];

export const outcomeQuestions: OnboardingQuestion[] = [
  {
    id: "desired_outcome",
    question: "What do you want most from Lansa right now?",
    options: [
      "Be taken seriously as a freelancer or creative professional",
      "Stand out and get hired for the kind of job I really want",
      "Figure out what makes me different and valuable",
      "Turn my ideas into something clear and actionable",
      "Finally feel confident about how I show up to others"
    ]
  }
];

// Legacy questions - keeping for backward compatibility
export const questions: OnboardingQuestion[] = [
  {
    id: "question1",
    question: "What brings you here today?",
    options: [
      "I want to get noticed and valued as a freelancer",
      "I'm trying to find a job that fits me",
      "I want more clarity for my business/idea",
      "I'm preparing for my next move as a student",
      "I'm not sure — I just know I want more"
    ]
  },
  {
    id: "question2",
    question: "What's been your biggest blocker?",
    options: [
      "I'm unclear how to talk about myself",
      "I feel invisible in my industry",
      "I don't know what steps to take",
      "I'm afraid I'll be misunderstood or ignored",
      "I've tried, but nothing stuck"
    ]
  },
  {
    id: "question3",
    question: "If we help you fix one thing in 30 days, what should it be?",
    options: [
      "People understand what I do clearly",
      "I have a solid online presence/profile",
      "I've figured out what I really want",
      "I'm getting more serious interest or responses",
      "I've taken real steps I'm proud of"
    ]
  }
];

export async function saveUserAnswers(userId: string, answers: UserAnswers) {
  try {
    console.log("Saving user answers:", userId, answers);
    
    // First, check if the user already has answers
    const { data: existingAnswers, error: fetchError } = await supabase
      .from('user_answers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error fetching existing answers:", fetchError);
      throw fetchError;
    }
    
    let result;
    
    // If user already has answers, update them
    if (existingAnswers) {
      console.log("Updating existing answers for user:", userId);
      const { error } = await supabase
        .from('user_answers')
        .update({ 
          question1: answers.question1 || existingAnswers.question1,
          question2: answers.question2 || existingAnswers.question2,
          question3: answers.question3 || existingAnswers.question3,
          gender: answers.gender || existingAnswers.gender,
          age_group: answers.age_group || existingAnswers.age_group,
          identity: answers.identity || existingAnswers.identity,
          desired_outcome: answers.desired_outcome || existingAnswers.desired_outcome,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error updating answers:", error);
        throw error;
      }
      result = { success: true };
    } else {
      // Otherwise, insert new answers
      console.log("Inserting new answers for user:", userId);
      const { error } = await supabase
        .from('user_answers')
        .insert([{ 
          user_id: userId, 
          question1: answers.question1,
          question2: answers.question2,
          question3: answers.question3,
          gender: answers.gender,
          age_group: answers.age_group,
          identity: answers.identity,
          desired_outcome: answers.desired_outcome
        }]);
      
      if (error) {
        console.error("Error inserting answers:", error);
        throw error;
      }
      result = { success: true };
    }
    
    // Also update the user profile with the same information
    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from('user_profiles')
          .update({ 
            gender: answers.gender || existingProfile.gender,
            age_group: answers.age_group || existingProfile.age_group,
            identity: answers.identity || existingProfile.identity,
            desired_outcome: answers.desired_outcome || existingProfile.desired_outcome,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_profiles')
          .insert([{ 
            user_id: userId, 
            gender: answers.gender,
            age_group: answers.age_group,
            identity: answers.identity,
            desired_outcome: answers.desired_outcome
          }]);
      }
    } catch (profileError) {
      console.error("Error updating user profile:", profileError);
      // Don't throw here, as the main user_answers update was successful
    }
    
    toast.success("Your answers have been saved successfully!");
    return result;
  } catch (error) {
    console.error('Error saving user answers:', error);
    toast.error("Failed to save your answers. Please try again.");
    return { success: false, error };
  }
}

export async function getUserAnswers(userId: string): Promise<UserAnswers | null> {
  try {
    console.log("Fetching user answers for:", userId);
    const { data, error } = await supabase
      .from('user_answers')
      .select('question1, question2, question3, gender, age_group, identity, desired_outcome')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    // If no data or empty array, return null
    if (!data || data.length === 0) {
      console.log("No answers found for user:", userId);
      return null;
    }
    
    console.log("Found answers for user:", userId, data[0]);
    // Return the most recent answer
    return data[0];
  } catch (error) {
    console.error('Error fetching user answers:', error);
    return null;
  }
}

export function getInsightFromAnswers(answers: UserAnswers): string {
  // Basic logic for insights based on the user's answers
  // In a real app, this would be more sophisticated
  
  const insights = [
    "Your desire to be seen and valued is the first step towards creating clarity. Most people miss this crucial starting point.",
    "You're already ahead of 80% of people by acknowledging what's blocking you. This awareness is powerful.",
    "Clarity isn't about having all the answers—it's about asking the right questions. You're already on that path.",
    "The path to visibility starts with understanding your unique value, which you're already exploring.",
    "Your specific combination of goals and challenges puts you in a unique position to stand out.",
    "Most people struggle with the same things you do, but few take action like you're doing now."
  ];
  
  // For MVP, just return a random insight
  return insights[Math.floor(Math.random() * insights.length)];
}

export function getProfileRole(answer1: string | undefined, identity?: string): string {
  if (identity) {
    switch (identity) {
      case "Freelancer": return "Freelancer seeking recognition";
      case "Job-seeker": return "Job seeker finding their fit";
      case "Student": return "Student preparing for the future";
      case "Entrepreneur": return "Business owner seeking clarity";
      case "Visionary": return "Visionary creating impact";
    }
  }

  // Legacy fallback logic
  if (!answer1) return "Professional seeking clarity";
  
  if (answer1.includes("freelancer")) return "Freelancer seeking recognition";
  if (answer1.includes("job")) return "Job seeker finding their fit";
  if (answer1.includes("business")) return "Business owner seeking clarity";
  if (answer1.includes("student")) return "Student preparing for the future";
  
  return "Professional seeking clarity";
}

export function getProfileGoal(answer3?: string, desiredOutcome?: string): string {
  if (desiredOutcome) {
    return desiredOutcome;
  }
  
  return answer3 || "Gaining professional clarity";
}

// Function to determine if user has completed the multi-step onboarding
export function hasCompletedOnboarding(answers: UserAnswers | null): boolean {
  if (!answers) return false;
  
  // Check if legacy onboarding was completed
  if (answers.question3) {
    return true;
  }
  
  // Check if new multi-step onboarding was completed
  return Boolean(answers.gender && answers.age_group && answers.identity && answers.desired_outcome);
}
