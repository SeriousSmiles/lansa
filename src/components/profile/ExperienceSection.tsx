
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExperienceCard } from "./experience/ExperienceCard";
import { ExperienceForm } from "./experience/ExperienceForm";
import { StaticExperienceCard } from "./experience/StaticExperienceCard";

interface ExperienceItem {
  id?: string;
  title: string;
  description: string;
  startYear?: number;
  endYear?: number | null;
}

interface ExperienceSectionProps {
  experiences: ExperienceItem[];
  onAddExperience?: (experience: ExperienceItem) => Promise<void>;
  onEditExperience?: (id: string, experience: ExperienceItem) => Promise<void>;
  onRemoveExperience?: (id: string) => Promise<void>;
  themeColor?: string;
  highlightColor?: string;
}

export function ExperienceSection({ 
  experiences, 
  onAddExperience, 
  onEditExperience, 
  onRemoveExperience,
  themeColor,
  highlightColor = "#FF6B4A"
}: ExperienceSectionProps) {
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [newExperience, setNewExperience] = useState<ExperienceItem>({ 
    title: "", 
    description: "",
    startYear: undefined,
    endYear: undefined
  });
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [editingExperience, setEditingExperience] = useState<ExperienceItem>({ 
    title: "", 
    description: "",
    startYear: undefined,
    endYear: undefined
  });

  const handleAddExperience = async () => {
    if (onAddExperience) {
      try {
        await onAddExperience(newExperience);
        setNewExperience({ 
          title: "", 
          description: "",
          startYear: undefined,
          endYear: undefined
        });
        setIsAddingExperience(false);
      } catch (error) {
        // Error handling is done in the ExperienceForm
      }
    }
  };

  const handleEditExperience = async () => {
    if (onEditExperience && editingExperienceId) {
      try {
        await onEditExperience(editingExperienceId, editingExperience);
        setEditingExperienceId(null);
      } catch (error) {
        // Error handling is done in the ExperienceForm
      }
    }
  };

  const startEditing = (exp: ExperienceItem) => {
    if (exp.id) {
      setEditingExperienceId(exp.id);
      setEditingExperience({ ...exp });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Briefcase className="h-5 w-5 mr-2" style={{ color: highlightColor }} />
            Experience
          </h2>
          {onAddExperience && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsAddingExperience(true)}
              style={{ color: highlightColor }}
              className="h-8 w-8 p-0" 
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {isAddingExperience && (
          <div className="mb-6">
            <ExperienceForm 
              title={newExperience.title}
              description={newExperience.description}
              startYear={newExperience.startYear}
              endYear={newExperience.endYear}
              onTitleChange={(title) => setNewExperience({...newExperience, title})}
              onDescriptionChange={(description) => setNewExperience({...newExperience, description})}
              onStartYearChange={(startYear) => setNewExperience({...newExperience, startYear})}
              onEndYearChange={(endYear) => setNewExperience({...newExperience, endYear})}
              onSave={handleAddExperience}
              onCancel={() => {
                setNewExperience({ 
                  title: "", 
                  description: "",
                  startYear: undefined,
                  endYear: undefined
                });
                setIsAddingExperience(false);
              }}
              isNew={true}
              highlightColor={highlightColor}
            />
          </div>
        )}
        
        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <div key={exp.id || index}>
              {editingExperienceId === exp.id ? (
                <ExperienceForm 
                  title={editingExperience.title}
                  description={editingExperience.description}
                  startYear={editingExperience.startYear}
                  endYear={editingExperience.endYear}
                  onTitleChange={(title) => setEditingExperience({...editingExperience, title})}
                  onDescriptionChange={(description) => setEditingExperience({...editingExperience, description})}
                  onStartYearChange={(startYear) => setEditingExperience({...editingExperience, startYear})}
                  onEndYearChange={(endYear) => setEditingExperience({...editingExperience, endYear})}
                  onSave={handleEditExperience}
                  onCancel={() => setEditingExperienceId(null)}
                  highlightColor={highlightColor}
                />
              ) : (
                <ExperienceCard 
                  id={exp.id || ''}
                  title={exp.title}
                  description={exp.description}
                  startYear={exp.startYear}
                  endYear={exp.endYear}
                  onEdit={onEditExperience ? () => startEditing(exp) : undefined}
                  onRemove={onRemoveExperience && exp.id ? () => onRemoveExperience(exp.id!) : undefined}
                  highlightColor={highlightColor}
                />
              )}
              
              {index < experiences.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
          
        </div>
      </CardContent>
    </Card>
  );
}
