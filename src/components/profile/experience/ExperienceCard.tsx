
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ExperienceCardProps {
  id: string;
  title: string;
  description: string;
  startYear?: number;
  endYear?: number | null;
  onEdit?: () => void;
  onRemove?: () => void;
  highlightColor?: string;
}

export function ExperienceCard({ 
  id, 
  title, 
  description,
  startYear,
  endYear,
  onEdit, 
  onRemove,
  highlightColor = "#FF6B4A"
}: ExperienceCardProps) {
  const formatYearRange = () => {
    if (!startYear) return "";
    const endDisplay = endYear === null ? "Present" : endYear;
    return `${startYear} - ${endDisplay}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          {(startYear || endYear !== undefined) && (
            <div className="text-sm text-muted-foreground">{formatYearRange()}</div>
          )}
        </div>
        
        {(onEdit || onRemove) && (
          <div className="flex space-x-1">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-8 w-8" 
                onClick={onEdit}
                style={{ color: highlightColor }}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            
            {onRemove && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-8 w-8" 
                    style={{ color: highlightColor }}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this experience.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onRemove}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>
      
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
