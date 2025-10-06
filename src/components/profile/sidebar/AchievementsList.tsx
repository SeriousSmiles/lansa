import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Edit2, Award, Trophy, Briefcase, Zap, ExternalLink, Star, BookOpen, Lightbulb, Users, Heart, Target, Mic, Code } from "lucide-react";
import { AchievementItem } from "@/hooks/profile/profileTypes";
import { cn } from "@/lib/utils";

interface AchievementsListProps {
  achievements: AchievementItem[];
  onAddAchievement?: (achievement: AchievementItem) => Promise<void>;
  onEditAchievement?: (id: string, achievement: AchievementItem) => Promise<void>;
  onRemoveAchievement?: (id: string) => Promise<void>;
  highlightColor?: string;
}

const achievementTypes = [
  { value: 'award', label: 'Award', icon: Trophy, color: '#FFD700' },
  { value: 'certification', label: 'Certification', icon: Award, color: '#4F46E5' },
  { value: 'project', label: 'Project', icon: Briefcase, color: '#10B981' },
  { value: 'skill', label: 'Skill Achievement', icon: Zap, color: '#F59E0B' },
  { value: 'work', label: 'Work Achievement', icon: Briefcase, color: '#8B5CF6' },
  { value: 'education', label: 'Academic Achievement', icon: Award, color: '#EF4444' },
  { value: 'publication', label: 'Publication', icon: BookOpen, color: '#06B6D4' },
  { value: 'patent', label: 'Patent', icon: Lightbulb, color: '#F59E0B' },
  { value: 'leadership', label: 'Leadership', icon: Users, color: '#F43F5E' },
  { value: 'volunteer', label: 'Volunteer Work', icon: Heart, color: '#EC4899' },
  { value: 'competition', label: 'Competition', icon: Target, color: '#DC2626' },
  { value: 'speaking', label: 'Speaking Engagement', icon: Mic, color: '#8B5CF6' },
  { value: 'hackathon', label: 'Hackathon', icon: Code, color: '#10B981' },
];

export function AchievementsList({ 
  achievements, 
  onAddAchievement, 
  onEditAchievement,
  onRemoveAchievement,
  highlightColor = "#FF6B4A"
}: AchievementsListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newAchievement, setNewAchievement] = useState({
    type: 'award' as AchievementItem['type'],
    title: "",
    description: "",
    dateAchieved: "",
    organization: "",
    credentialId: "",
    credentialUrl: "",
    isFeatured: false
  });
  
  const [editAchievement, setEditAchievement] = useState({
    type: 'award' as AchievementItem['type'],
    title: "",
    description: "",
    dateAchieved: "",
    organization: "",
    credentialId: "",
    credentialUrl: "",
    isFeatured: false
  });

  const getAchievementIcon = (type: string) => {
    const achievementType = achievementTypes.find(t => t.value === type);
    const Icon = achievementType?.icon || Award;
    return <Icon className="w-5 h-5" style={{ color: achievementType?.color }} />;
  };

  const getAchievementColor = (type: string) => {
    return achievementTypes.find(t => t.value === type)?.color || highlightColor;
  };

  const handleAdd = async () => {
    if (newAchievement.title.trim() && newAchievement.description.trim() && onAddAchievement) {
      try {
        await onAddAchievement({
          type: newAchievement.type,
          title: newAchievement.title.trim(),
          description: newAchievement.description.trim(),
          dateAchieved: newAchievement.dateAchieved || undefined,
          organization: newAchievement.organization || undefined,
          credentialId: newAchievement.credentialId || undefined,
          credentialUrl: newAchievement.credentialUrl || undefined,
          isFeatured: newAchievement.isFeatured
        });
        setNewAchievement({ type: 'award', title: "", description: "", dateAchieved: "", organization: "", credentialId: "", credentialUrl: "", isFeatured: false });
        setIsAdding(false);
      } catch (error) {
        console.error("Error adding achievement:", error);
      }
    }
  };

  const handleEdit = async (id: string) => {
    if (editAchievement.title.trim() && editAchievement.description.trim() && onEditAchievement) {
      try {
        await onEditAchievement(id, {
          id,
          type: editAchievement.type,
          title: editAchievement.title.trim(),
          description: editAchievement.description.trim(),
          dateAchieved: editAchievement.dateAchieved || undefined,
          organization: editAchievement.organization || undefined,
          credentialId: editAchievement.credentialId || undefined,
          credentialUrl: editAchievement.credentialUrl || undefined,
          isFeatured: editAchievement.isFeatured
        });
        setEditingId(null);
        setEditAchievement({ type: 'award', title: "", description: "", dateAchieved: "", organization: "", credentialId: "", credentialUrl: "", isFeatured: false });
      } catch (error) {
        console.error("Error editing achievement:", error);
      }
    }
  };

  const startEdit = (achievement: AchievementItem) => {
    setEditingId(achievement.id || "");
    setEditAchievement({
      type: achievement.type,
      title: achievement.title,
      description: achievement.description,
      dateAchieved: achievement.dateAchieved || "",
      organization: achievement.organization || "",
      credentialId: achievement.credentialId || "",
      credentialUrl: achievement.credentialUrl || "",
      isFeatured: achievement.isFeatured || false
    });
  };

  const toggleFeatured = async (achievement: AchievementItem) => {
    if (!onEditAchievement || !achievement.id) return;
    
    try {
      await onEditAchievement(achievement.id, {
        ...achievement,
        isFeatured: !achievement.isFeatured
      });
    } catch (error) {
      console.error("Error toggling featured status:", error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAchievement({ type: 'award', title: "", description: "", dateAchieved: "", organization: "", credentialId: "", credentialUrl: "", isFeatured: false });
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewAchievement({ type: 'award', title: "", description: "", dateAchieved: "", organization: "", credentialId: "", credentialUrl: "", isFeatured: false });
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
    <Card className="border-2" style={{ borderColor: `${highlightColor}30` }}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{ color: highlightColor }} />
            <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>
              Achievements & Awards
            </h3>
          </div>
          {onAddAchievement && !isAdding && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsAdding(true)}
              style={{ color: highlightColor }}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add achievement</span>
            </Button>
          )}
        </div>
        
        {isAdding && (
          <div className="space-y-3 mb-4 p-4 border rounded-lg bg-muted/30">
            <Select value={newAchievement.type} onValueChange={(value) => setNewAchievement({ ...newAchievement, type: value as AchievementItem['type'] })}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select achievement type" />
              </SelectTrigger>
              <SelectContent>
                {achievementTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" style={{ color: type.color }} />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input 
              value={newAchievement.title} 
              onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
              placeholder="Achievement title *"
              className="h-9"
            />
            <Textarea 
              value={newAchievement.description} 
              onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
              placeholder="Description *"
              className="min-h-[80px]"
            />
            <Input 
              value={newAchievement.organization} 
              onChange={(e) => setNewAchievement({ ...newAchievement, organization: e.target.value })}
              placeholder="Organization (optional)"
              className="h-9"
            />
            <Input 
              type="date"
              value={newAchievement.dateAchieved} 
              onChange={(e) => setNewAchievement({ ...newAchievement, dateAchieved: e.target.value })}
              placeholder="Date achieved"
              className="h-9"
            />
            <Input 
              value={newAchievement.credentialId} 
              onChange={(e) => setNewAchievement({ ...newAchievement, credentialId: e.target.value })}
              placeholder="Credential ID (optional)"
              className="h-9"
            />
            <Input 
              value={newAchievement.credentialUrl} 
              onChange={(e) => setNewAchievement({ ...newAchievement, credentialUrl: e.target.value })}
              placeholder="Credential URL (optional)"
              className="h-9"
            />
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="new-featured"
                checked={newAchievement.isFeatured}
                onChange={(e) => setNewAchievement({ ...newAchievement, isFeatured: e.target.checked })}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="new-featured" className="text-sm text-muted-foreground">
                Feature this achievement (max 3)
              </label>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9" 
                onClick={handleAdd}
                disabled={!newAchievement.title.trim() || !newAchievement.description.trim()}
                style={{ 
                  borderColor: `${highlightColor}50`,
                  color: highlightColor
                }}
              >
                Add Achievement
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
          {sortedAchievements.map((achievement, index) => (
            <div key={achievement.id || index}>
              {editingId === achievement.id ? (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                  <Select value={editAchievement.type} onValueChange={(value) => setEditAchievement({ ...editAchievement, type: value as AchievementItem['type'] })}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {achievementTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" style={{ color: type.color }} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    value={editAchievement.title} 
                    onChange={(e) => setEditAchievement({ ...editAchievement, title: e.target.value })}
                    placeholder="Achievement title"
                    className="h-9"
                  />
                  <Textarea 
                    value={editAchievement.description} 
                    onChange={(e) => setEditAchievement({ ...editAchievement, description: e.target.value })}
                    placeholder="Description"
                    className="min-h-[80px]"
                  />
                  <Input 
                    value={editAchievement.organization} 
                    onChange={(e) => setEditAchievement({ ...editAchievement, organization: e.target.value })}
                    placeholder="Organization (optional)"
                    className="h-9"
                  />
                  <Input 
                    type="date"
                    value={editAchievement.dateAchieved} 
                    onChange={(e) => setEditAchievement({ ...editAchievement, dateAchieved: e.target.value })}
                    className="h-9"
                  />
                  <Input 
                    value={editAchievement.credentialId} 
                    onChange={(e) => setEditAchievement({ ...editAchievement, credentialId: e.target.value })}
                    placeholder="Credential ID (optional)"
                    className="h-9"
                  />
                  <Input 
                    value={editAchievement.credentialUrl} 
                    onChange={(e) => setEditAchievement({ ...editAchievement, credentialUrl: e.target.value })}
                    placeholder="Credential URL (optional)"
                    className="h-9"
                  />
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="edit-featured"
                      checked={editAchievement.isFeatured}
                      onChange={(e) => setEditAchievement({ ...editAchievement, isFeatured: e.target.checked })}
                      className="h-4 w-4 rounded"
                    />
                    <label htmlFor="edit-featured" className="text-sm text-muted-foreground">
                      Feature this achievement
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9" 
                      onClick={() => handleEdit(achievement.id || "")}
                      disabled={!editAchievement.title.trim() || !editAchievement.description.trim()}
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
                <div 
                  className={cn(
                    "relative p-4 border rounded-xl hover:bg-muted/50 transition-all",
                    achievement.isFeatured && "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-300 dark:border-yellow-700 shadow-lg"
                  )}
                >
                  {achievement.isFeatured && (
                    <div className="absolute top-2 right-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${getAchievementColor(achievement.type)}20` }}
                    >
                      {getAchievementIcon(achievement.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-sm">{achievement.title}</h4>
                        {achievement.dateAchieved && (
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {new Date(achievement.dateAchieved).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      {achievement.organization && (
                        <p className="text-sm text-muted-foreground mb-2">{achievement.organization}</p>
                      )}
                      <p className="text-sm text-foreground/80 leading-relaxed">{achievement.description}</p>
                      {achievement.credentialId && (
                        <p className="text-xs text-muted-foreground mt-2">ID: {achievement.credentialId}</p>
                      )}
                      {achievement.credentialUrl && (
                        <a 
                          href={achievement.credentialUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs inline-flex items-center gap-1 mt-2 hover:underline"
                          style={{ color: highlightColor }}
                        >
                          View credential <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 ml-3 flex-shrink-0">
                      <button
                        onClick={() => toggleFeatured(achievement)}
                        className="p-1 opacity-60 hover:opacity-100 transition-opacity"
                        title={achievement.isFeatured ? "Unfeature" : "Feature"}
                      >
                        <Star className={cn("h-4 w-4", achievement.isFeatured && "fill-yellow-400 text-yellow-400")} />
                      </button>
                      {onEditAchievement && (
                        <button
                          onClick={() => startEdit(achievement)}
                          className="p-1 opacity-60 hover:opacity-100 transition-opacity"
                          style={{ color: highlightColor }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      {onRemoveAchievement && (
                        <button
                          onClick={() => onRemoveAchievement(achievement.id || "")}
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

        {achievements.length === 0 && !isAdding && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-2">No achievements added yet</p>
            <p className="text-xs mb-4">Showcase your accomplishments and stand out!</p>
            {onAddAchievement && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAdding(true)}
                style={{ 
                  borderColor: `${highlightColor}50`,
                  color: highlightColor 
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add your first achievement
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
