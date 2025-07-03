import { OnboardingQuestion } from "./types";

// PHASE 1: Simplified 2-question onboarding for speed-to-value
export const essentialQuestions: OnboardingQuestion[] = [
  {
    id: "desired_outcome",
    question: "What are you trying to achieve?",
    options: [
      "Land the job I really want",
      "Get recognition for my creative work", 
      "Gain clarity on my professional direction",
      "Attract better clients and opportunities",
      "Build confidence in how I present myself"
    ]
  },
  {
    id: "identity",
    question: "How do you see yourself professionally?",
    options: [
      "Freelancer",
      "Job-seeker", 
      "Creative Professional",
      "Entrepreneur",
      "Visionary"
    ]
  }
];

// Legacy questions - keeping for backward compatibility
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
