
interface MagicMoment {
  title: string;
  reflection: string;
  insight: string;
  cta: string;
}

type MagicMomentKey = 
  | 'freelancer_respect'
  | 'job_seeker_standout'
  | 'student_identity'
  | 'entrepreneur_clarity'
  | 'visionary_confidence'
  | 'default';

export const magicMoments: Record<MagicMomentKey, MagicMoment> = {
  freelancer_respect: {
    title: "You're Ready To Be Valued For Your Expertise",
    reflection: "As a freelancer seeking respect, you're not just looking for more clients — you're looking for the right recognition. Most freelancers focus only on skills, but your professional identity needs equal attention.",
    insight: "The freelancers who get respect aren't just good — they're clear about their value and position themselves accordingly.",
    cta: "Let's build your visibility blueprint"
  },
  job_seeker_standout: {
    title: "Stand Out By Being Strategically Authentic",
    reflection: "As a job-seeker wanting to stand out, you've likely been told to 'just be yourself' — but that's only half the equation. Strategic authenticity means knowing which parts of yourself align with the opportunities you want.",
    insight: "When you understand how your unique strengths connect to market needs, you stop competing and start attracting the right opportunities.",
    cta: "Let's build your visibility blueprint"
  },
  student_identity: {
    title: "Your Professional Identity Is Already Emerging",
    reflection: "As a student figuring out what makes you valuable, you're ahead of most of your peers who wait until graduation. Your professional identity is already forming through your interests and work approach.",
    insight: "The most successful students don't wait for a degree to validate them — they actively curate experiences that showcase their unique perspective.",
    cta: "Let's build your visibility blueprint"
  },
  entrepreneur_clarity: {
    title: "Clarity Is Your Competitive Advantage",
    reflection: "As an entrepreneur turning ideas into action, you know having a great concept isn't enough. Your ability to articulate your vision clearly will be the difference between interest and investment.",
    insight: "The entrepreneurs who break through fastest aren't necessarily the most innovative — they're the ones who make their innovation the easiest to understand and support.",
    cta: "Let's build your visibility blueprint"
  },
  visionary_confidence: {
    title: "Your Vision Deserves Your Confidence",
    reflection: "As a visionary seeking confidence in how you show up, you're facing the classic innovator's dilemma: your ideas challenge the status quo, which naturally creates resistance.",
    insight: "The visionaries who make the biggest impact aren't necessarily the boldest — they're the ones who learned to communicate their ideas in ways that build bridges rather than walls.",
    cta: "Let's build your visibility blueprint"
  },
  default: {
    title: "Your Professional Clarity Journey Begins Now",
    reflection: "Based on your responses, you're at an important turning point in how you present yourself professionally. The gap between where you are and where you want to be isn't about skills — it's about clarity and positioning.",
    insight: "The professionals who advance fastest aren't just good at what they do — they're intentional about how they're perceived and positioned in their field.",
    cta: "Let's build your visibility blueprint"
  }
};

export function getMagicMoment(identity?: string, desiredOutcome?: string): MagicMoment {
  if (!identity || !desiredOutcome) {
    return magicMoments.default;
  }
  
  // Map desired outcomes to simplified keys for matching
  const outcomeMap: Record<string, string> = {
    "Be taken seriously as a freelancer or creative professional": "taken_seriously",
    "Stand out and get hired for the kind of job I really want": "standout",
    "Figure out what makes me different and valuable": "clarity",
    "Turn my ideas into something clear and actionable": "actionable",
    "Finally feel confident about how I show up to others": "confidence"
  };
  
  const outcomeKey = outcomeMap[desiredOutcome] || "";
  
  // Match identity and outcome to return the appropriate magic moment
  if (identity === "Freelancer" && outcomeKey === "taken_seriously") {
    return magicMoments.freelancer_respect;
  }
  
  if (identity === "Job-seeker" && outcomeKey === "standout") {
    return magicMoments.job_seeker_standout;
  }
  
  if (identity === "Student" && outcomeKey === "clarity") {
    return magicMoments.student_identity;
  }
  
  if (identity === "Entrepreneur" && outcomeKey === "actionable") {
    return magicMoments.entrepreneur_clarity;
  }
  
  if (identity === "Visionary" && outcomeKey === "confidence") {
    return magicMoments.visionary_confidence;
  }
  
  // Default case - choose based on identity only
  switch (identity) {
    case "Freelancer":
      return magicMoments.freelancer_respect;
    case "Job-seeker":
      return magicMoments.job_seeker_standout;
    case "Student":
      return magicMoments.student_identity;
    case "Entrepreneur":
      return magicMoments.entrepreneur_clarity;
    case "Visionary":
      return magicMoments.visionary_confidence;
    default:
      return magicMoments.default;
  }
}
