
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";

interface ProfileCardProps {
  role: string;
  goal: string;
}

export function ProfileCard({ role, goal }: ProfileCardProps) {
  return (
    <AnimatedCard delay={0.1} className="h-auto hover-lift">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg md:text-xl">Your Profile</CardTitle>
        <CardDescription>Based on your onboarding answers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Role</h3>
            <div className="flex flex-col gap-1">
              <p className="text-base md:text-lg">{role}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Goal</h3>
            <div className="flex flex-col gap-1">
              <p className="text-base md:text-lg">{goal}</p>
            </div>
          </div>
          <div className="pt-1">
            <Link to="/profile">
              <Button variant="outline" size="sm" className="btn-animate">View Full Profile</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </AnimatedCard>
  );
}
