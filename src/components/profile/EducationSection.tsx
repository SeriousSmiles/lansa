
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EducationForm } from "./education/EducationForm";
import { EducationHeader } from "./education/EducationHeader";
import { EducationList } from "./education/EducationList";

interface EducationItem {
  id?: string;
  title: string;
  description: string;
  startYear?: number;
  endYear?: number | null;
}

interface EducationSectionProps {
  education: EducationItem[];
  onAddEducation?: (education: EducationItem) => Promise<void>;
  onEditEducation?: (id: string, education: EducationItem) => Promise<void>;
  onRemoveEducation?: (id: string) => Promise<void>;
  themeColor?: string;
  highlightColor?: string;
}

export function EducationSection({ 
  education, 
  onAddEducation, 
  onEditEducation, 
  onRemoveEducation,
  themeColor,
  highlightColor = "#FF6B4A"
}: EducationSectionProps) {
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [newEducation, setNewEducation] = useState<EducationItem>({ 
    title: "", 
    description: "",
    startYear: undefined,
    endYear: undefined
  });

  const handleAddEducation = async () => {
    if (onAddEducation && newEducation.title.trim()) {
      try {
        await onAddEducation(newEducation);
        setNewEducation({ 
          title: "", 
          description: "",
          startYear: undefined,
          endYear: undefined
        });
        setIsAddingEducation(false);
      } catch (error) {
        console.error("Error adding education:", error);
      }
    }
  };

  const handleCancelAdd = () => {
    setNewEducation({ 
      title: "", 
      description: "",
      startYear: undefined,
      endYear: undefined
    });
    setIsAddingEducation(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <EducationHeader 
          onAdd={onAddEducation ? () => setIsAddingEducation(true) : undefined}
          highlightColor={highlightColor}
        />
        
        {isAddingEducation && (
          <div className="mb-6">
            <EducationForm
              title={newEducation.title}
              description={newEducation.description}
              startYear={newEducation.startYear}
              endYear={newEducation.endYear}
              onTitleChange={(title) => setNewEducation({...newEducation, title})}
              onDescriptionChange={(description) => setNewEducation({...newEducation, description})}
              onStartYearChange={(startYear) => setNewEducation({...newEducation, startYear})}
              onEndYearChange={(endYear) => setNewEducation({...newEducation, endYear})}
              onSave={handleAddEducation}
              onCancel={handleCancelAdd}
              isNew={true}
              highlightColor={highlightColor}
            />
          </div>
        )}
        
        <EducationList
          education={education}
          onEdit={onEditEducation}
          onRemove={onRemoveEducation}
          highlightColor={highlightColor}
        />
      </CardContent>
    </Card>
  );
}
