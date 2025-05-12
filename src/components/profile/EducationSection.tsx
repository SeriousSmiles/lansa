
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Pencil, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

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
}

export function EducationSection({ 
  education, 
  onAddEducation, 
  onEditEducation, 
  onRemoveEducation 
}: EducationSectionProps) {
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [newEducation, setNewEducation] = useState<EducationItem>({ title: "", description: "" });
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [editingEducation, setEditingEducation] = useState<EducationItem>({ title: "", description: "" });
  const { toast } = useToast();

  const handleAddEducation = async () => {
    if (!newEducation.title || !newEducation.description) {
      toast({
        title: "Validation error",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }

    if (onAddEducation) {
      try {
        await onAddEducation(newEducation);
        setNewEducation({ title: "", description: "" });
        setIsAddingEducation(false);
        toast({
          title: "Education added",
          description: "Your new education has been added to your profile.",
        });
      } catch (error) {
        toast({
          title: "Error adding education",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditEducation = async () => {
    if (!editingEducationId || !editingEducation.title || !editingEducation.description) {
      toast({
        title: "Validation error",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }

    if (onEditEducation) {
      try {
        await onEditEducation(editingEducationId, editingEducation);
        setEditingEducationId(null);
        toast({
          title: "Education updated",
          description: "Your education has been updated.",
        });
      } catch (error) {
        toast({
          title: "Error updating education",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  const startEditing = (edu: EducationItem) => {
    if (edu.id) {
      setEditingEducationId(edu.id);
      setEditingEducation({ ...edu });
    }
  };

  const handleRemoveEducation = async (id: string) => {
    if (onRemoveEducation) {
      try {
        await onRemoveEducation(id);
        toast({
          title: "Education removed",
          description: "The education has been removed from your profile.",
        });
      } catch (error) {
        toast({
          title: "Error removing education",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <GraduationCap className="h-5 w-5 text-[#FF6B4A] mr-2" />
            Education & Learning
          </h2>
          {onAddEducation && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setIsAddingEducation(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Add Education</span>
            </Button>
          )}
        </div>
        
        {isAddingEducation && (
          <div className="mb-6 border p-4 rounded-md bg-gray-50">
            <h3 className="font-medium mb-2">Add New Education</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input 
                  value={newEducation.title}
                  onChange={(e) => setNewEducation({...newEducation, title: e.target.value})}
                  placeholder="Education title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea 
                  value={newEducation.description}
                  onChange={(e) => setNewEducation({...newEducation, description: e.target.value})}
                  placeholder="Describe your education"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <Button onClick={handleAddEducation} size="sm">Save</Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setNewEducation({ title: "", description: "" });
                    setIsAddingEducation(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {education.map((edu, index) => (
            <div key={edu.id || index}>
              {editingEducationId === edu.id ? (
                <div className="border p-4 rounded-md bg-gray-50">
                  <h3 className="font-medium mb-2">Edit Education</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <Input 
                        value={editingEducation.title}
                        onChange={(e) => setEditingEducation({...editingEducation, title: e.target.value})}
                        placeholder="Education title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea 
                        value={editingEducation.description}
                        onChange={(e) => setEditingEducation({...editingEducation, description: e.target.value})}
                        placeholder="Describe your education"
                      />
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button onClick={handleEditEducation} size="sm">Update</Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingEducationId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row group">
                  <div className="md:w-1/3">
                    <h3 className="text-lg font-semibold text-[#FF6B4A]">{edu.title}</h3>
                    <p className="text-gray-500">Present</p>
                  </div>
                  <div className="md:w-2/3 relative">
                    <h4 className="font-medium">Professional Development Program</h4>
                    <p className="text-gray-600 mt-1">
                      {edu.description}
                    </p>
                    
                    {(onEditEducation || onRemoveEducation) && edu.id && (
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex">
                        {onEditEducation && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => startEditing(edu)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        )}
                        
                        {onRemoveEducation && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={() => handleRemoveEducation(edu.id!)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {index < education.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
