
import { Card, CardContent } from "@/components/ui/card";

interface AboutSectionProps {
  role: string;
  goal: string;
  blocker: string;
}

export function AboutSection({ role, goal, blocker }: AboutSectionProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-4">About Me</h2>
        <p className="mb-4">
          Based on your onboarding answers, you identified as a {role.toLowerCase()} 
          who wants to {goal.toLowerCase()}. You're at the beginning of your 
          clarity journey, and we're here to help you achieve your goals.
        </p>
        <h3 className="text-lg font-semibold mb-2">My Biggest Challenge</h3>
        <blockquote className="border-l-4 border-[#FF6B4A] pl-4 italic">
          "{blocker}"
        </blockquote>
      </CardContent>
    </Card>
  );
}
