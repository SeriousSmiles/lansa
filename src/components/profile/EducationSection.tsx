
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EducationItem {
  id?: string;
  title: string;
  description: string;
}

interface EducationSectionProps {
  education: EducationItem[];
  onAddEducation?: (education: EducationItem) => Promise<void>;
  onEditEducation?: (id: string, education: EducationItem) => Promise<void>;
  onRemoveEducation?: (id: string) => Promise<void>;
  themeColor?: string;
  highlightColor?: string; // Added highlightColor property
}

export function EducationSection({ 
  education, 
  onAddEducation, 
  onEditEducation, 
  onRemoveEducation,
  themeColor,
  highlightColor = "#FF6B4A" // Default to original orange
}: EducationSectionProps) {
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [newEducation, setNewEducation] = useState<EducationItem>({ title: "", description: "" });
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [editingEducation, setEditingEducation] = useState<EducationItem>({ title: "", description: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [educationToDelete, setEducationToDelete] = useState<string | null>(null);

  const handleAddEducation = async () => {
    if (onAddEducation && newEducation.title.trim()) {
      try {
        await onAddEducation(newEducation);
        setNewEducation({ title: "", description: "" });
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
            <GraduationCap className="h-5 w-5 mr-2" style={{ color: highlightColor }} />
            Education
          </h2>
          
          {onAddEducation && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setIsAddingEducation(true)}
              style={themeColor ? {
                borderColor: `${themeColor}50`,
                color: themeColor
              } : {}}
            >
              <Plus className="h-4 w-4" />
              <span>Add Education</span>
            </Button>
          )}
        </div>
        
        {isAddingEducation && (
          <div className="space-y-4 mb-6 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>Add Education</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Name of Institution / Qualification</label>
              <Input 
                value={newEducation.title} 
                onChange={(e) => setNewEducation({...newEducation, title: e.target.value})} 
                placeholder="e.g. University of Technology, Master's Degree"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={newEducation.description} 
                onChange={(e) => setNewEducation({...newEducation, description: e.target.value})} 
                placeholder="Describe your education, major, achievements, etc."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleAddEducation}
                disabled={!newEducation.title.trim()}
                style={{ 
                  backgroundColor: highlightColor,
                  color: getContrastTextColor(highlightColor)
                }}
              >
                Save Education
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setNewEducation({ title: "", description: "" });
                  setIsAddingEducation(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {education.map((edu, index) => (
            <div key={edu.id || index}>
              {editingEducationId === edu.id ? (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>Edit Education</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name of Institution / Qualification</label>
                    <Input 
                      value={editingEducation.title} 
                      onChange={(e) => setEditingEducation({...editingEducation, title: e.target.value})} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      value={editingEducation.description} 
                      onChange={(e) => setEditingEducation({...editingEducation, description: e.target.value})} 
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleEditEducation}
                      disabled={!editingEducation.title.trim()}
                      style={{ 
                        backgroundColor: highlightColor,
                        color: getContrastTextColor(highlightColor)
                      }}
                    >
                      Save Changes
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingEducationId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{edu.title}</h3>
                    
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
