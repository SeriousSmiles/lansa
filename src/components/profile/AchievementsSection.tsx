import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Plus, Star, Trophy, Sparkles, Target, Briefcase, GraduationCap, BookOpen, Lightbulb, Users, Heart, Code, Mic, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AchievementItem } from "@/hooks/profile/profileTypes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AchievementModal } from "@/components/modals/AchievementModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface AchievementsSectionProps {
  achievements: AchievementItem[];
  onAddAchievement?: (achievement: AchievementItem) => Promise<void>;
  onEditAchievement?: (id: string, achievement: AchievementItem) => Promise<void>;
  onRemoveAchievement?: (id: string) => Promise<void>;
  themeColor?: string;
  highlightColor?: string;
}

const achievementTypeIcons = {
  award: Trophy,
  project: Sparkles,
  skill: Target,
  work: Briefcase,
  education: GraduationCap,
  publication: BookOpen,
  patent: Lightbulb,
  leadership: Users,
  volunteer: Heart,
  competition: Trophy,
  speaking: Mic,
  hackathon: Code,
};

const achievementTypeColors = {
  award: "text-yellow-500",
  project: "text-purple-500",
  skill: "text-green-500",
  work: "text-orange-500",
  education: "text-indigo-500",
  publication: "text-cyan-500",
  patent: "text-amber-500",
  leadership: "text-rose-500",
  volunteer: "text-pink-500",
  competition: "text-red-500",
  speaking: "text-violet-500",
  hackathon: "text-emerald-500",
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<AchievementItem | undefined>(undefined);

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

  const handleEdit = (achievement: AchievementItem) => {
    setEditingAchievement(achievement);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingAchievement(undefined);
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
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${highlightColor}20` }}
            >
              <Award className="w-4 h-4 md:w-5 md:h-5" style={{ color: highlightColor }} />
            </div>
            <h2 className="text-base md:text-xl font-bold text-foreground truncate">Achievements & Awards</h2>
          </div>
          {/* Mobile: icon-only 44px tap target. Desktop: full-label outline button. */}
          <Button
            onClick={() => setShowAddModal(true)}
            size="icon"
            variant="outline"
            aria-label="Add achievement"
            className="md:hidden h-11 w-11 flex-shrink-0"
            style={{ borderColor: highlightColor, color: highlightColor }}
          >
            <Plus className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            variant="outline"
            className="hidden md:inline-flex gap-2 flex-shrink-0"
            style={{ borderColor: highlightColor, color: highlightColor }}
          >
            <Plus className="w-4 h-4" />
            Add Achievement
          </Button>
        </div>

        {sortedAchievements.length === 0 ? (
          <div className="text-center py-8 md:py-12">
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
          <div className="space-y-3 md:space-y-4">
            {sortedAchievements.map((achievement) => {
              const Icon = achievementTypeIcons[achievement.type as keyof typeof achievementTypeIcons] || Award;
              const colorClass = achievementTypeColors[achievement.type as keyof typeof achievementTypeColors] || "text-gray-500";
              
              return (
                <div
                  key={achievement.id}
                  className={cn(
                    "relative p-3.5 md:p-4 rounded-xl border transition-all group hover:shadow-md",
                    achievement.isFeatured
                      ? "bg-primary/5 border-primary/30 shadow-sm"
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0",
                        achievement.isFeatured ? "bg-primary/10" : "bg-muted"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 md:w-6 md:h-6", colorClass)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title row: title + inline Featured pill, then meta row beneath */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground text-sm md:text-base leading-snug">
                            {achievement.title}
                          </h3>
                          {achievement.isFeatured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium">
                              <Star className="w-3 h-3 fill-current" />
                              Featured
                            </span>
                          )}
                        </div>

                        {/* Mobile-friendly always-visible action menu */}
                        {(onEditAchievement || onRemoveAchievement) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Achievement actions"
                                className="h-8 w-8 -mr-1 -mt-1 flex-shrink-0 text-muted-foreground hover:text-foreground"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              {onEditAchievement && (
                                <DropdownMenuItem onClick={() => handleToggleFeatured(achievement)}>
                                  <Star className={cn("w-4 h-4 mr-2", achievement.isFeatured && "fill-current text-primary")} />
                                  {achievement.isFeatured ? "Unfeature" : "Feature"}
                                </DropdownMenuItem>
                              )}
                              {onEditAchievement && (
                                <DropdownMenuItem onClick={() => handleEdit(achievement)}>
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {onRemoveAchievement && achievement.id && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => achievement.id && handleDelete(achievement.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      {/* Meta line: organization · date — wraps cleanly on mobile */}
                      {(achievement.organization || achievement.dateAchieved) && (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground mb-2">
                          {achievement.organization && <span>{achievement.organization}</span>}
                          {achievement.organization && achievement.dateAchieved && <span aria-hidden="true">·</span>}
                          {achievement.dateAchieved && (
                            <span>
                              {new Date(achievement.dateAchieved).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3 md:line-clamp-2">
                        {achievement.description}
                      </p>
                      
                      {(achievement.credentialId || achievement.credentialUrl) && (
                        <div className="flex flex-wrap gap-2 mt-2">
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      {/* Achievement Modal */}
      <AchievementModal
        isOpen={showAddModal || !!editingAchievement}
        onClose={handleCloseModal}
        onAddAchievement={onAddAchievement}
        achievement={editingAchievement}
        onEditAchievement={onEditAchievement}
      />
    </Card>
  );
}
