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
}

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
    // First, check if the user already has answers
    const { data: existingAnswers } = await supabase
      .from('user_answers')
      .select('*')
      .eq('user_id', userId)
      .limit(1);
    
    let result;
    
    // If user already has answers, update them
    if (existingAnswers && existingAnswers.length > 0) {
      const { error } = await supabase
        .from('user_answers')
        .update({ 
          question1: answers.question1,
          question2: answers.question2,
          question3: answers.question3,
          updated_at: new Date()
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      result = { success: true };
    } else {
      // Otherwise, insert new answers
      const { error } = await supabase
        .from('user_answers')
        .insert([{ 
          user_id: userId, 
          question1: answers.question1,
          question2: answers.question2,
          question3: answers.question3
        }]);
      
      if (error) throw error;
      result = { success: true };
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
    const { data, error } = await supabase
      .from('user_answers')
      .select('question1, question2, question3')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    // If no data or empty array, return null
    if (!data || data.length === 0) {
      return null;
    }
    
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

export function getProfileRole(answer1: string | undefined): string {
  if (!answer1) return "Professional seeking clarity";
  
  if (answer1.includes("freelancer")) return "Freelancer seeking recognition";
  if (answer1.includes("job")) return "Job seeker finding their fit";
  if (answer1.includes("business")) return "Business owner seeking clarity";
  if (answer1.includes("student")) return "Student preparing for the future";
  
  return "Professional seeking clarity";
}

export function getProfileGoal(answer3: string | undefined): string {
  return answer3 || "Gaining professional clarity";
}
