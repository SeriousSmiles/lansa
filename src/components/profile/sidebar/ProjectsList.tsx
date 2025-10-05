import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, X, Edit2, ExternalLink, Star } from "lucide-react";
import { ProjectItem } from "@/hooks/profile/profileTypes";

interface ProjectsListProps {
  projects: ProjectItem[];
  onAddProject?: (project: ProjectItem) => Promise<void>;
  onEditProject?: (id: string, project: ProjectItem) => Promise<void>;
  onRemoveProject?: (id: string) => Promise<void>;
  highlightColor?: string;
}

export function ProjectsList({ 
  projects, 
  onAddProject, 
  onEditProject,
  onRemoveProject,
  highlightColor = "#FF6B4A"
}: ProjectsListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    url: "",
    technologies: [] as string[],
    techInput: "",
    start_date: "",
    end_date: "",
    is_featured: false
  });
  
  const [editProject, setEditProject] = useState({
    title: "",
    description: "",
    url: "",
    technologies: [] as string[],
    techInput: "",
    start_date: "",
    end_date: "",
    is_featured: false
  });

  const handleAddTech = (isEdit: boolean) => {
    const input = isEdit ? editProject.techInput : newProject.techInput;
    if (!input.trim()) return;
    
    if (isEdit) {
      setEditProject({
        ...editProject,
        technologies: [...editProject.technologies, input.trim()],
        techInput: ""
      });
    } else {
      setNewProject({
        ...newProject,
        technologies: [...newProject.technologies, input.trim()],
        techInput: ""
      });
    }
  };

  const handleRemoveTech = (tech: string, isEdit: boolean) => {
    if (isEdit) {
      setEditProject({
        ...editProject,
        technologies: editProject.technologies.filter(t => t !== tech)
      });
    } else {
      setNewProject({
        ...newProject,
        technologies: newProject.technologies.filter(t => t !== tech)
      });
    }
  };

  const handleAddProject = async () => {
    if (newProject.title.trim() && onAddProject) {
      try {
        await onAddProject({
          title: newProject.title.trim(),
          description: newProject.description || undefined,
          url: newProject.url || undefined,
          technologies: newProject.technologies.length > 0 ? newProject.technologies : undefined,
          start_date: newProject.start_date || undefined,
          end_date: newProject.end_date || undefined,
          is_featured: newProject.is_featured
        });
        setNewProject({ title: "", description: "", url: "", technologies: [], techInput: "", start_date: "", end_date: "", is_featured: false });
        setIsAdding(false);
      } catch (error) {
        console.error("Error adding project:", error);
      }
    }
  };

  const handleEditProject = async (id: string) => {
    if (editProject.title.trim() && onEditProject) {
      try {
        await onEditProject(id, {
          id,
          title: editProject.title.trim(),
          description: editProject.description || undefined,
          url: editProject.url || undefined,
          technologies: editProject.technologies.length > 0 ? editProject.technologies : undefined,
          start_date: editProject.start_date || undefined,
          end_date: editProject.end_date || undefined,
          is_featured: editProject.is_featured
        });
        setEditingId(null);
        setEditProject({ title: "", description: "", url: "", technologies: [], techInput: "", start_date: "", end_date: "", is_featured: false });
      } catch (error) {
        console.error("Error editing project:", error);
      }
    }
  };

  const startEdit = (project: ProjectItem) => {
    setEditingId(project.id || "");
    setEditProject({
      title: project.title,
      description: project.description || "",
      url: project.url || "",
      technologies: project.technologies || [],
      techInput: "",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      is_featured: project.is_featured || false
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditProject({ title: "", description: "", url: "", technologies: [], techInput: "", start_date: "", end_date: "", is_featured: false });
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewProject({ title: "", description: "", url: "", technologies: [], techInput: "", start_date: "", end_date: "", is_featured: false });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>Projects</h3>
          {onAddProject && !isAdding && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsAdding(true)}
              style={{ color: highlightColor }}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add project</span>
            </Button>
          )}
        </div>
        
        {isAdding && (
          <div className="space-y-3 mb-4 p-4 border rounded-lg">
            <Input 
              value={newProject.title} 
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              placeholder="Project title"
              className="h-9"
            />
            <Textarea 
              value={newProject.description} 
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Project description"
              className="min-h-[60px]"
            />
            <Input 
              value={newProject.url} 
              onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
              placeholder="Project URL (optional)"
              className="h-9"
            />
            <div className="space-y-2">
              <Label className="text-xs">Technologies</Label>
              <div className="flex gap-2">
                <Input 
                  value={newProject.techInput} 
                  onChange={(e) => setNewProject({ ...newProject, techInput: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTech(false);
                    }
                  }}
                  placeholder="Add technology"
                  className="h-9"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAddTech(false)}
                  className="h-9"
                >
                  Add
                </Button>
              </div>
              {newProject.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newProject.technologies.map((tech, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <button onClick={() => handleRemoveTech(tech, false)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input 
                  type="month"
                  value={newProject.start_date} 
                  onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs">End Date (optional)</Label>
                <Input 
                  type="month"
                  value={newProject.end_date} 
                  onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                  placeholder="Ongoing if empty"
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="featured-add"
                checked={newProject.is_featured}
                onCheckedChange={(checked) => setNewProject({ ...newProject, is_featured: checked })}
              />
              <Label htmlFor="featured-add" className="text-sm">Featured project</Label>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9" 
                onClick={handleAddProject}
                disabled={!newProject.title.trim()}
                style={{ 
                  borderColor: `${highlightColor}50`,
                  color: highlightColor
                }}
              >
                Add
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 px-2" 
                onClick={cancelAdd}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {projects.map((project, index) => (
            <div key={project.id || index}>
              {editingId === project.id ? (
                <div className="space-y-3 p-4 border rounded-lg">
                  <Input 
                    value={editProject.title} 
                    onChange={(e) => setEditProject({ ...editProject, title: e.target.value })}
                    placeholder="Project title"
                    className="h-9"
                  />
                  <Textarea 
                    value={editProject.description} 
                    onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                    placeholder="Project description"
                    className="min-h-[60px]"
                  />
                  <Input 
                    value={editProject.url} 
                    onChange={(e) => setEditProject({ ...editProject, url: e.target.value })}
                    placeholder="Project URL (optional)"
                    className="h-9"
                  />
                  <div className="space-y-2">
                    <Label className="text-xs">Technologies</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={editProject.techInput} 
                        onChange={(e) => setEditProject({ ...editProject, techInput: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTech(true);
                          }
                        }}
                        placeholder="Add technology"
                        className="h-9"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAddTech(true)}
                        className="h-9"
                      >
                        Add
                      </Button>
                    </div>
                    {editProject.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editProject.technologies.map((tech, idx) => (
                          <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                            {tech}
                            <button onClick={() => handleRemoveTech(tech, true)}>
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Start Date</Label>
                      <Input 
                        type="month"
                        value={editProject.start_date} 
                        onChange={(e) => setEditProject({ ...editProject, start_date: e.target.value })}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End Date (optional)</Label>
                      <Input 
                        type="month"
                        value={editProject.end_date} 
                        onChange={(e) => setEditProject({ ...editProject, end_date: e.target.value })}
                        placeholder="Ongoing if empty"
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured-edit"
                      checked={editProject.is_featured}
                      onCheckedChange={(checked) => setEditProject({ ...editProject, is_featured: checked })}
                    />
                    <Label htmlFor="featured-edit" className="text-sm">Featured project</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9" 
                      onClick={() => handleEditProject(project.id || "")}
                      disabled={!editProject.title.trim()}
                      style={{ 
                        borderColor: `${highlightColor}50`,
                        color: highlightColor
                      }}
                    >
                      Save
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 px-2" 
                      onClick={cancelEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{project.title}</h4>
                          {project.is_featured && (
                            <Star className="h-3 w-3" style={{ color: highlightColor, fill: highlightColor }} />
                          )}
                        </div>
                        {project.start_date && (
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {new Date(project.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Ongoing'}
                          </span>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{project.description}</p>
                      )}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs py-0"
                                   style={{ borderColor: `${highlightColor}30`, color: highlightColor }}>
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {project.url && (
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs inline-flex items-center gap-1 mt-2 hover:underline"
                          style={{ color: highlightColor }}
                        >
                          View project <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1 ml-3 flex-shrink-0">
                      {onEditProject && (
                        <button
                          onClick={() => startEdit(project)}
                          className="p-1 opacity-60 hover:opacity-100 transition-opacity"
                          style={{ color: highlightColor }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      {onRemoveProject && (
                        <button
                          onClick={() => onRemoveProject(project.id || "")}
                          className="p-1 opacity-60 hover:opacity-100 transition-opacity text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {projects.length === 0 && !isAdding && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No projects added yet</p>
            {onAddProject && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={() => setIsAdding(true)}
                style={{ color: highlightColor }}
              >
                Add your first project
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}