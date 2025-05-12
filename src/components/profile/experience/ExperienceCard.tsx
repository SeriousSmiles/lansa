
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExperienceCardProps {
  id: string;
  title: string;
  description: string;
  onEdit?: () => void;
  onRemove?: () => void;
  highlightColor?: string; // Added highlightColor property
}

export function ExperienceCard({ 
  id, 
  title, 
  description, 
  onEdit, 
  onRemove,
  highlightColor = "#FF6B4A" // Default to original orange
}: ExperienceCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (onRemove) {
      onRemove();
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{title}</h3>
        
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-8 w-8" 
                onClick={() => setIsDeleteDialogOpen(true)}
                style={{ color: highlightColor }}
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        )}
      </div>
      
      <p className="text-gray-600">{description}</p>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this experience from your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
