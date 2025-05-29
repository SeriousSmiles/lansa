
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Pencil, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { EducationForm } from "./education/EducationForm";

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
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [editingEducation, setEditingEducation] = useState<EducationItem>({ 
    title: "", 
    description: "",
    startYear: undefined,
    endYear: undefined
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [educationToDelete, setEducationToDelete] = useState<string | null>(null);

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

  const handleEditEducation = async () => {
    if (onEditEducation && editingEducationId && editingEducation.title.trim()) {
      try {
        await onEditEducation(editingEducationId, editingEducation);
        setEditingEducationId(null);
      } catch (error) {
        console.error("Error editing education:", error);
      }
    }
  };

  const confirmDelete = () => {
    if (onRemoveEducation && educationToDelete) {
      onRemoveEducation(educationToDelete);
    }
    setDeleteDialogOpen(false);
    setEducationToDelete(null);
  };

  const startEditing = (edu: EducationItem) => {
    if (edu.id) {
      setEditingEducationId(edu.id);
      setEditingEducation({ ...edu });
    }
  };

  const handleDelete = (id: string) => {
    setEducationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const formatYearRange = (startYear?: number, endYear?: number | null) => {
    if (!startYear) return "";
    const endDisplay = endYear === null ? "Present" : endYear;
    return `${startYear} - ${endDisplay}`;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" style={{ color: highlightColor }} />
            Education
          </h2>
          
          {onAddEducation && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsAddingEducation(true)}
              style={{ color: highlightColor }}
              className="h-8 w-8 p-0" 
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>
        
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
              onCancel={() => {
                setNewEducation({ 
                  title: "", 
                  description: "",
                  startYear: undefined,
                  endYear: undefined
                });
                setIsAddingEducation(false);
              }}
              isNew={true}
              highlightColor={highlightColor}
            />
          </div>
        )}
        
        <div className="space-y-6">
          {education.map((edu, index) => (
            <div key={edu.id || index}>
              {editingEducationId === edu.id ? (
                <EducationForm
                  title={editingEducation.title}
                  description={editingEducation.description}
                  startYear={editingEducation.startYear}
                  endYear={editingEducation.endYear}
                  onTitleChange={(title) => setEditingEducation({...editingEducation, title})}
                  onDescriptionChange={(description) => setEditingEducation({...editingEducation, description})}
                  onStartYearChange={(startYear) => setEditingEducation({...editingEducation, startYear})}
                  onEndYearChange={(endYear) => setEditingEducation({...editingEducation, endYear})}
                  onSave={handleEditEducation}
                  onCancel={() => setEditingEducationId(null)}
                  highlightColor={highlightColor}
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{edu.title}</h3>
                      {(edu.startYear || edu.endYear !== undefined) && (
                        <div className="text-sm text-muted-foreground">
                          {formatYearRange(edu.startYear, edu.endYear)}
                        </div>
                      )}
                    </div>
                    
                    {(onEditEducation || onRemoveEducation) && (
                      <div className="flex space-x-1">
                        {onEditEducation && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-0 h-8 w-8" 
                            onClick={() => startEditing(edu)}
                            style={{ color: highlightColor }}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        )}
                        
                        {onRemoveEducation && edu.id && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-0 h-8 w-8" 
                            onClick={() => handleDelete(edu.id!)}
                            style={{ color: highlightColor }}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600">{edu.description}</p>
                </div>
              )}
              
              {index < education.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </div>
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this education entry.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
