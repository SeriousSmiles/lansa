import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProjectItem } from "./profileTypes";

interface UseProfileProjectsProps {
  userId: string | undefined;
}

export function useProfileProjects({ userId }: UseProfileProjectsProps) {
  const [userProjects, setUserProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Function to fetch projects from database
  const fetchProjects = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', userId)
        .order('is_featured', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) throw error;

      const projects: ProjectItem[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        url: row.url || undefined,
        technologies: row.technologies || undefined,
        start_date: row.start_date || undefined,
        end_date: row.end_date || undefined,
        is_featured: row.is_featured || false
      }));

      setUserProjects(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error loading projects",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a new project
  const addProject = async (project: ProjectItem) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_projects')
        .insert({
          user_id: userId,
          title: project.title,
          description: project.description || null,
          url: project.url || null,
          technologies: project.technologies || null,
          start_date: project.start_date || null,
          end_date: project.end_date || null,
          is_featured: project.is_featured || false
        })
        .select()
        .single();

      if (error) throw error;

      const newProject: ProjectItem = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        url: data.url || undefined,
        technologies: data.technologies || undefined,
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
        is_featured: data.is_featured || false
      };

      setUserProjects(prev => [newProject, ...prev]);
      
      toast({
        title: "Project added",
        description: `${project.title} has been added to your profile.`,
      });
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
        title: "Error adding project",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to edit a project
  const editProject = async (id: string, updatedProject: ProjectItem) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('user_projects')
        .update({
          title: updatedProject.title,
          description: updatedProject.description || null,
          url: updatedProject.url || null,
          technologies: updatedProject.technologies || null,
          start_date: updatedProject.start_date || null,
          end_date: updatedProject.end_date || null,
          is_featured: updatedProject.is_featured || false
        })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setUserProjects(prev => 
        prev.map(proj => proj.id === id ? { ...updatedProject, id } : proj)
      );
      
      toast({
        title: "Project updated",
        description: `${updatedProject.title} has been updated.`,
      });
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error updating project",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to remove a project
  const removeProject = async (id: string) => {
    if (!userId) return;
    
    try {
      const projectToRemove = userProjects.find(proj => proj.id === id);
      
      const { error } = await supabase
        .from('user_projects')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setUserProjects(prev => prev.filter(proj => proj.id !== id));
      
      toast({
        title: "Project removed",
        description: `${projectToRemove?.title || 'Project'} has been removed from your profile.`,
      });
    } catch (error) {
      console.error("Error removing project:", error);
      toast({
        title: "Error removing project",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    userProjects,
    setUserProjects,
    isLoading,
    fetchProjects,
    addProject,
    editProject,
    removeProject
  };
}