import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Plus, Star, Trophy, Sparkles, Target, Briefcase, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AchievementItem } from "@/hooks/profile/profileTypes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AchievementsSectionProps {
  achievements: AchievementItem[];
  onAddAchievement?: (achievement: AchievementItem) => Promise<void>;
  onEditAchievement?: (id: string, achievement: AchievementItem) => Promise<void>;
  onRemoveAchievement?: (id: string) => Promise<void>;
  themeColor?: string;
  highlightColor?: string;
}

const achievementTypeIcons = {
  certification: Star,
  award: Trophy,
  project: Sparkles,
  skill: Target,
  work: Briefcase,
  education: GraduationCap,
};

const achievementTypeColors = {
  certification: "text-blue-500",
  award: "text-yellow-500",
  project: "text-purple-500",
  skill: "text-green-500",
  work: "text-orange-500",
  education: "text-indigo-500",
};

export function AchievementsSection({ 
  achievements, 
  onAddAchievement, 
  onEditAchievement, 
  onRemoveAchievement,
  themeColor,
  highlightColor = "#FF6B4A"
}: AchievementsSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleToggleFeatured = async (achievement: AchievementItem) => {
    if (!onEditAchievement || !achievement.id) return;
    
    try {
      await onEditAchievement(achievement.id, {
        ...achievement,
        isFeatured: !achievement.isFeatured
      });
    } catch (error) {
      console.error("Error toggling featured:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onRemoveAchievement) return;
    
    try {
      await onRemoveAchievement(id);
    } catch (error) {
      console.error("Error deleting achievement:", error);
    }
  };

  // Sort achievements: featured first, then by date
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    if (a.dateAchieved && b.dateAchieved) {
      return new Date(b.dateAchieved).getTime() - new Date(a.dateAchieved).getTime();
    }
    return 0;
  });

  return (
    <Card className="overflow-hidden border-2 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${highlightColor}20` }}
            >
              <Award className="w-5 h-5" style={{ color: highlightColor }} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Achievements & Awards</h2>
          </div>
          <Button
            onClick={() => toast.info("Add achievement feature coming soon")}
            size="sm"
            variant="outline"
            className="gap-2"
            style={{ borderColor: highlightColor, color: highlightColor }}
          >
            <Plus className="w-4 h-4" />
            Add Achievement
          </Button>
        </div>

        {sortedAchievements.length === 0 ? (
          <div className="text-center py-12">
            <div 
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${highlightColor}10` }}
            >
              <Trophy className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-2">No achievements added yet</p>
            <p className="text-xs text-muted-foreground">
              Showcase your accomplishments and stand out!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAchievements.map((achievement) => {
              const Icon = achievementTypeIcons[achievement.type as keyof typeof achievementTypeIcons] || Award;
              const colorClass = achievementTypeColors[achievement.type as keyof typeof achievementTypeColors] || "text-gray-500";
              
              return (
                <div
                  key={achievement.id}
                  className={cn(
                    "relative p-4 rounded-xl border transition-all group hover:shadow-md",
                    achievement.isFeatured 
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-300 dark:border-yellow-700 shadow-lg shadow-yellow-100 dark:shadow-none" 
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  {achievement.isFeatured && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div 
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                        achievement.isFeatured ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-muted"
                      )}
                    >
                      <Icon className={cn("w-6 h-6", colorClass)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-base line-clamp-2">
                            {achievement.title}
                          </h3>
                          {achievement.organization && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {achievement.organization}
                            </p>
                          )}
                        </div>
                        {achievement.dateAchieved && (
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {new Date(achievement.dateAchieved).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2 mb-3">
                        {achievement.description}
                      </p>
                      
                      {(achievement.credentialId || achievement.credentialUrl) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {achievement.credentialId && (
                            <span className="text-xs px-2 py-1 bg-muted rounded-md">
                              ID: {achievement.credentialId}
                            </span>
                          )}
                          {achievement.credentialUrl && (
                            <a 
                              href={achievement.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-2 py-1 rounded-md hover:underline"
                              style={{ color: highlightColor }}
                            >
                              View Credential →
                            </a>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          onClick={() => handleToggleFeatured(achievement)}
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                        >
                          <Star className={cn("w-3 h-3 mr-1", achievement.isFeatured && "fill-current")} />
                          {achievement.isFeatured ? "Unfeature" : "Feature"}
                        </Button>
                        <Button
                          onClick={() => toast.info("Edit feature coming soon")}
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => achievement.id && handleDelete(achievement.id)}
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
