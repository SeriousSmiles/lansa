
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Briefcase, Pencil, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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
}

export function ExperienceSection({ 
  experiences, 
  onAddExperience, 
  onEditExperience, 
  onRemoveExperience 
}: ExperienceSectionProps) {
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [newExperience, setNewExperience] = useState<ExperienceItem>({ title: "", description: "" });
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [editingExperience, setEditingExperience] = useState<ExperienceItem>({ title: "", description: "" });
  const { toast } = useToast();

  const handleAddExperience = async () => {
    if (!newExperience.title || !newExperience.description) {
      toast({
        title: "Validation error",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }

    if (onAddExperience) {
      try {
        await onAddExperience(newExperience);
        setNewExperience({ title: "", description: "" });
        setIsAddingExperience(false);
        toast({
          title: "Experience added",
          description: "Your new experience has been added to your profile.",
        });
      } catch (error) {
        toast({
          title: "Error adding experience",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditExperience = async () => {
    if (!editingExperienceId || !editingExperience.title || !editingExperience.description) {
      toast({
        title: "Validation error",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }

    if (onEditExperience) {
      try {
        await onEditExperience(editingExperienceId, editingExperience);
        setEditingExperienceId(null);
        toast({
          title: "Experience updated",
          description: "Your experience has been updated.",
        });
      } catch (error) {
        toast({
          title: "Error updating experience",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  const startEditing = (exp: ExperienceItem) => {
    if (exp.id) {
      setEditingExperienceId(exp.id);
      setEditingExperience({ ...exp });
    }
  };

  const handleRemoveExperience = async (id: string) => {
    if (onRemoveExperience) {
      try {
        await onRemoveExperience(id);
        toast({
          title: "Experience removed",
          description: "The experience has been removed from your profile.",
        });
      } catch (error) {
        toast({
          title: "Error removing experience",
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
            <Briefcase className="h-5 w-5 text-[#FF6B4A] mr-2" />
            Experience
          </h2>
          {onAddExperience && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setIsAddingExperience(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Add Experience</span>
            </Button>
          )}
        </div>
        
        {isAddingExperience && (
          <div className="mb-6 border p-4 rounded-md bg-gray-50">
            <h3 className="font-medium mb-2">Add New Experience</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input 
                  value={newExperience.title}
                  onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                  placeholder="Experience title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea 
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                  placeholder="Describe your experience"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <Button onClick={handleAddExperience} size="sm">Save</Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setNewExperience({ title: "", description: "" });
                    setIsAddingExperience(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <div key={exp.id || index}>
              {editingExperienceId === exp.id ? (
                <div className="border p-4 rounded-md bg-gray-50">
                  <h3 className="font-medium mb-2">Edit Experience</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <Input 
                        value={editingExperience.title}
                        onChange={(e) => setEditingExperience({...editingExperience, title: e.target.value})}
                        placeholder="Experience title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea 
                        value={editingExperience.description}
                        onChange={(e) => setEditingExperience({...editingExperience, description: e.target.value})}
                        placeholder="Describe your experience"
                      />
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button onClick={handleEditExperience} size="sm">Update</Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingExperienceId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row group">
                  <div className="md:w-1/3">
                    <h3 className="text-lg font-semibold text-[#FF6B4A]">{exp.title}</h3>
                    <p className="text-gray-500">Present</p>
                  </div>
                  <div className="md:w-2/3 relative">
                    <h4 className="font-medium">Professional Development</h4>
                    <p className="text-gray-600 mt-1">
                      {exp.description}
                    </p>
                    
                    {(onEditExperience || onRemoveExperience) && exp.id && (
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex">
                        {onEditExperience && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => startEditing(exp)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        )}
                        
                        {onRemoveExperience && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={() => handleRemoveExperience(exp.id!)}
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
              
              {index < experiences.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
          
          {experiences.length > 0 && <Separator />}
          
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3">
              <h3 className="text-lg font-semibold text-[#FF6B4A]">Career Explorer</h3>
              <p className="text-gray-500">Past</p>
            </div>
            <div className="md:w-2/3">
              <h4 className="font-medium">Self-Discovery</h4>
              <p className="text-gray-600 mt-1">
                Explored various professional paths and opportunities 
                to better understand strengths, weaknesses, and career aspirations.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
