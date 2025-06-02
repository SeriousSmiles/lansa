
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface RecommendedActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  icon?: LucideIcon;
  onClick?: () => void;
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
    <Card className={`group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
      isHighlighted 
        ? 'ring-2 ring-[#FF6B4A] ring-opacity-50 bg-gradient-to-br from-white to-orange-50/40 shadow-md' 
        : 'bg-white border border-gray-200 hover:border-gray-300'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className={`p-2.5 rounded-lg transition-colors duration-200 ${
              isHighlighted 
                ? 'bg-[#FF6B4A]/15 group-hover:bg-[#FF6B4A]/20' 
                : 'bg-gray-100 group-hover:bg-[#FF6B4A]/10'
            }`}>
              <Icon className={`h-5 w-5 transition-colors duration-200 ${
                isHighlighted 
                  ? 'text-[#FF6B4A]' 
                  : 'text-gray-600 group-hover:text-[#FF6B4A]'
              }`} />
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight text-gray-900">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{description}</p>
        <Button 
          onClick={onClick}
          className={`w-full transition-all duration-200 font-medium ${
            isHighlighted 
              ? 'bg-[#FF6B4A] hover:bg-[#E55A3A] text-white shadow-md hover:shadow-lg' 
              : 'border border-gray-300 bg-white text-gray-700 hover:bg-[#FF6B4A] hover:text-white hover:border-[#FF6B4A]'
          }`}
          variant={isHighlighted ? "primary" : "outline"}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
