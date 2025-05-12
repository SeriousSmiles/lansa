
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

interface ExperienceCardProps {
  id: string;
  title: string;
  description: string;
  onEdit?: () => void;
  onRemove?: () => void;
}

export function ExperienceCard({ 
  id, 
  title, 
  description, 
  onEdit, 
  onRemove 
}: ExperienceCardProps) {
  return (
    <div className="flex flex-col md:flex-row group">
      <div className="md:w-1/3">
        <h3 className="text-lg font-semibold text-[#FF6B4A]">{title}</h3>
        <p className="text-gray-500">Present</p>
      </div>
      <div className="md:w-2/3 relative">
        <h4 className="font-medium">Professional Development</h4>
        <p className="text-gray-600 mt-1">
          {description}
        </p>
        
        {(onEdit || onRemove) && (
          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            
            {onRemove && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-red-500"
                onClick={onRemove}
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
