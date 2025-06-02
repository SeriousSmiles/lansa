
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface RecommendedActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  icon: LucideIcon;
  onClick: () => void;
  isHighlighted?: boolean;
}

export function RecommendedActionCard({
  title,
  description,
  buttonText,
  icon: Icon,
  onClick,
  isHighlighted = false
}: RecommendedActionCardProps) {
  return (
    <Card className={`transition-shadow duration-200 hover:shadow-md ${
      isHighlighted ? 'ring-2 ring-[#FF6B4A] ring-opacity-50 bg-orange-50/30' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF6B4A]/10 rounded-lg">
            <Icon className="h-5 w-5 text-[#FF6B4A]" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{description}</p>
        <Button 
          onClick={onClick}
          className="w-full transition-colors duration-200"
          variant={isHighlighted ? "default" : "outline"}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
