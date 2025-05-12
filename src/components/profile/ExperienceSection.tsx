
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
}

interface ExperienceSectionProps {
  experiences: ExperienceItem[];
  onAddExperience?: (experience: ExperienceItem) => Promise<void>;
  onEditExperience?: (id: string, experience: ExperienceItem) => Promise<void>;
  onRemoveExperience?: (id: string) => Promise<void>;
  themeColor?: string;
  highlightColor?: string; // Added highlightColor property
}

export function ExperienceSection({ 
  experiences, 
  onAddExperience, 
  onEditExperience, 
  onRemoveExperience,
  themeColor,
  highlightColor = "#FF6B4A" // Default to the original orange color
}: ExperienceSectionProps) {
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [newExperience, setNewExperience] = useState<ExperienceItem>({ title: "", description: "" });
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [editingExperience, setEditingExperience] = useState<ExperienceItem>({ title: "", description: "" });

  const handleAddExperience = async () => {
    if (onAddExperience) {
      try {
        await onAddExperience(newExperience);
        setNewExperience({ title: "", description: "" });
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

  // Calculate text contrast color for better readability
  const getContrastTextColor = (hexColor: string): string => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
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
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setIsAddingExperience(true)}
              style={themeColor ? {
                borderColor: `${themeColor}50`,
                color: themeColor
              } : {}}
            >
              <Plus className="h-4 w-4" />
              <span>Add Experience</span>
            </Button>
          )}
        </div>
        
        {isAddingExperience && (
          <div className="mb-6">
            <ExperienceForm 
              title={newExperience.title}
              description={newExperience.description}
              onTitleChange={(title) => setNewExperience({...newExperience, title})}
              onDescriptionChange={(description) => setNewExperience({...newExperience, description})}
              onSave={handleAddExperience}
              onCancel={() => {
                setNewExperience({ title: "", description: "" });
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
                  onTitleChange={(title) => setEditingExperience({...editingExperience, title})}
                  onDescriptionChange={(description) => setEditingExperience({...editingExperience, description})}
                  onSave={handleEditExperience}
                  onCancel={() => setEditingExperienceId(null)}
                  highlightColor={highlightColor}
                />
              ) : (
                <ExperienceCard 
                  id={exp.id || ''}
                  title={exp.title}
                  description={exp.description}
                  onEdit={onEditExperience ? () => startEditing(exp) : undefined}
                  onRemove={onRemoveExperience && exp.id ? () => onRemoveExperience(exp.id!) : undefined}
                  highlightColor={highlightColor}
                />
              )}
              
              {index < experiences.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
          
          {experiences.length > 0 && <Separator />}
          
          <StaticExperienceCard
            title="Career Explorer"
            period="Past"
            subtitle="Self-Discovery"
            description="Explored various professional paths and opportunities to better understand strengths, weaknesses, and career aspirations."
            highlightColor={highlightColor}
          />
        </div>
      </CardContent>
    </Card>
  );
}
