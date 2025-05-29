
import { GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EducationHeaderProps {
  onAdd?: () => void;
  highlightColor?: string;
}

export function EducationHeader({ onAdd, highlightColor = "#FF6B4A" }: EducationHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold flex items-center">
        <GraduationCap className="h-5 w-5 mr-2" style={{ color: highlightColor }} />
        Education
      </h2>
      
      {onAdd && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onAdd}
          style={{ color: highlightColor }}
          className="h-8 w-8 p-0" 
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
