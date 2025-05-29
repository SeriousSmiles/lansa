
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { EducationForm } from "./EducationForm";

interface EducationItem {
  id?: string;
  title: string;
  description: string;
  startYear?: number;
  endYear?: number | null;
}

interface EducationItemProps {
  education: EducationItem;
  index: number;
  totalItems: number;
  onEdit?: (id: string, education: EducationItem) => Promise<void>;
  onDelete?: (id: string) => void;
  highlightColor?: string;
}

export function EducationItemComponent({ 
  education, 
  index, 
  totalItems,
  onEdit, 
  onDelete,
  highlightColor = "#FF6B4A"
}: EducationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingEducation, setEditingEducation] = useState<EducationItem>(education);

  const formatYearRange = (startYear?: number, endYear?: number | null) => {
    if (!startYear) return "";
    const endDisplay = endYear === null ? "Present" : endYear;
    return `${startYear} - ${endDisplay}`;
  };

  const handleEdit = async () => {
    if (onEdit && education.id && editingEducation.title.trim()) {
      try {
        await onEdit(education.id, editingEducation);
        setIsEditing(false);
      } catch (error) {
        console.error("Error editing education:", error);
      }
    }
  };

  const handleDelete = () => {
    if (onDelete && education.id) {
      onDelete(education.id);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditingEducation({ ...education });
  };

  if (isEditing) {
    return (
      <EducationForm
        title={editingEducation.title}
        description={editingEducation.description}
        startYear={editingEducation.startYear}
        endYear={editingEducation.endYear}
        onTitleChange={(title) => setEditingEducation({...editingEducation, title})}
        onDescriptionChange={(description) => setEditingEducation({...editingEducation, description})}
        onStartYearChange={(startYear) => setEditingEducation({...editingEducation, startYear})}
        onEndYearChange={(endYear) => setEditingEducation({...editingEducation, endYear})}
        onSave={handleEdit}
        onCancel={() => setIsEditing(false)}
        highlightColor={highlightColor}
      />
    );
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{education.title}</h3>
            {(education.startYear || education.endYear !== undefined) && (
              <div className="text-sm text-muted-foreground">
                {formatYearRange(education.startYear, education.endYear)}
              </div>
            )}
          </div>
          
          {(onEdit || onDelete) && (
            <div className="flex space-x-1">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-8 w-8" 
                  onClick={startEditing}
                  style={{ color: highlightColor }}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              
              {onDelete && education.id && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-8 w-8" 
                  onClick={handleDelete}
                  style={{ color: highlightColor }}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          )}
        </div>
        
        <p className="text-gray-600">{education.description}</p>
      </div>
      
      {index < totalItems - 1 && <Separator className="my-4" />}
    </>
  );
}
