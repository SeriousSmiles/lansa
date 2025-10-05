import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AchievementItem } from "./profileTypes";

interface UseProfileAchievementsProps {
  userId: string | undefined;
}

export function useProfileAchievements({ userId }: UseProfileAchievementsProps) {
  const [userAchievements, setUserAchievements] = useState<AchievementItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch achievements from database
  const fetchAchievements = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('is_featured', { ascending: false })
        .order('date_achieved', { ascending: false, nullsFirst: false });

      if (error) throw error;

      const achievements: AchievementItem[] = (data || []).map(row => ({
        id: row.id,
        type: row.type as 'certification' | 'award' | 'project' | 'skill' | 'work' | 'education',
        title: row.title,
        description: row.description,
        dateAchieved: row.date_achieved || undefined,
        organization: row.organization || undefined,
        credentialId: row.credential_id || undefined,
        credentialUrl: row.credential_url || undefined,
        isFeatured: row.is_featured || false,
        displayOrder: row.display_order || 0
      }));

      setUserAchievements(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast({
        title: "Error loading achievements",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new achievement
  const addAchievement = async (achievement: AchievementItem) => {
    if (!userId) return;
    
    try {
      // Check featured limit (max 3)
      const featuredCount = userAchievements.filter(a => a.isFeatured).length;
      if (achievement.isFeatured && featuredCount >= 3) {
        toast({
          title: "Featured limit reached",
          description: "You can only feature up to 3 achievements. Please unfeature another first.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          type: achievement.type,
          title: achievement.title,
          description: achievement.description,
          date_achieved: achievement.dateAchieved || null,
          organization: achievement.organization || null,
          credential_id: achievement.credentialId || null,
          credential_url: achievement.credentialUrl || null,
          is_featured: achievement.isFeatured || false,
          display_order: achievement.displayOrder || 0
        })
        .select()
        .single();

      if (error) throw error;

      const newAchievement: AchievementItem = {
        id: data.id,
        type: data.type as 'certification' | 'award' | 'project' | 'skill' | 'work' | 'education',
        title: data.title,
        description: data.description,
        dateAchieved: data.date_achieved || undefined,
        organization: data.organization || undefined,
        credentialId: data.credential_id || undefined,
        credentialUrl: data.credential_url || undefined,
        isFeatured: data.is_featured || false,
        displayOrder: data.display_order || 0
      };

      setUserAchievements(prev => [newAchievement, ...prev]);
      
      toast({
        title: "Achievement added",
        description: `${achievement.title} has been added to your profile.`,
      });
    } catch (error) {
      console.error("Error adding achievement:", error);
      toast({
        title: "Error adding achievement",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Edit an achievement
  const editAchievement = async (id: string, updatedAchievement: AchievementItem) => {
    if (!userId) return;
    
    try {
      // Check featured limit if trying to feature
      if (updatedAchievement.isFeatured) {
        const currentAchievement = userAchievements.find(a => a.id === id);
        if (!currentAchievement?.isFeatured) {
          const featuredCount = userAchievements.filter(a => a.isFeatured).length;
          if (featuredCount >= 3) {
            toast({
              title: "Featured limit reached",
              description: "You can only feature up to 3 achievements. Please unfeature another first.",
              variant: "destructive",
            });
            return;
          }
        }
      }

      const { error } = await supabase
        .from('user_achievements')
        .update({
          type: updatedAchievement.type,
          title: updatedAchievement.title,
          description: updatedAchievement.description,
          date_achieved: updatedAchievement.dateAchieved || null,
          organization: updatedAchievement.organization || null,
          credential_id: updatedAchievement.credentialId || null,
          credential_url: updatedAchievement.credentialUrl || null,
          is_featured: updatedAchievement.isFeatured || false,
          display_order: updatedAchievement.displayOrder || 0
        })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setUserAchievements(prev => 
        prev.map(achievement => 
          achievement.id === id ? { ...updatedAchievement, id } : achievement
        )
      );
      
      toast({
        title: "Achievement updated",
        description: `${updatedAchievement.title} has been updated.`,
      });
    } catch (error) {
      console.error("Error updating achievement:", error);
      toast({
        title: "Error updating achievement",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Remove an achievement
  const removeAchievement = async (id: string) => {
    if (!userId) return;
    
    try {
      const achievementToRemove = userAchievements.find(a => a.id === id);
      
      const { error } = await supabase
        .from('user_achievements')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setUserAchievements(prev => prev.filter(a => a.id !== id));
      
      toast({
        title: "Achievement removed",
        description: `${achievementToRemove?.title || 'Achievement'} has been removed from your profile.`,
      });
    } catch (error) {
      console.error("Error removing achievement:", error);
      toast({
        title: "Error removing achievement",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    userAchievements,
    setUserAchievements,
    isLoading,
    fetchAchievements,
    addAchievement,
    editAchievement,
    removeAchievement
  };
}
