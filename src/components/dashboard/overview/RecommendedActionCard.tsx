
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";

interface RecommendedActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  delay: number;
}

export function RecommendedActionCard({ title, description, buttonText, delay }: RecommendedActionCardProps) {
  return (
    <AnimatedCard delay={delay} className="animated-card h-auto hover-scale">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm">{description}</p>
        <Button variant="outline" size="full" className="btn-animate">{buttonText}</Button>
      </CardContent>
    </AnimatedCard>
  );
}
