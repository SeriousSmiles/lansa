import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Plus, X, Edit2 } from "lucide-react";
import { LanguageItem } from "@/hooks/profile/profileTypes";

interface LanguagesListProps {
  languages: LanguageItem[];
  onAddLanguage?: (language: LanguageItem) => Promise<void>;
  onEditLanguage?: (id: string, language: LanguageItem) => Promise<void>;
  onRemoveLanguage?: (id: string) => Promise<void>;
  highlightColor?: string;
}

const LEVEL_NAMES = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];

export function LanguagesList({ 
  languages, 
  onAddLanguage, 
  onEditLanguage,
  onRemoveLanguage,
  highlightColor = "#FF6B4A"
}: LanguagesListProps) {
  const [newLanguage, setNewLanguage] = useState("");
  const [newLevel, setNewLevel] = useState(3); // Default to Intermediate
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState(3);

  const handleAddLanguage = async () => {
    if (newLanguage.trim() && onAddLanguage) {
      try {
        await onAddLanguage({
          name: newLanguage.trim(),
          level: newLevel
        });
        setNewLanguage("");
        setNewLevel(3);
        setIsAdding(false);
      } catch (error) {
        console.error("Error adding language:", error);
      }
    }
  };

  const handleEditLanguage = async (id: string) => {
    if (editName.trim() && onEditLanguage) {
      try {
        await onEditLanguage(id, {
          id,
          name: editName.trim(),
          level: editLevel
        });
        setEditingId(null);
        setEditName("");
        setEditLevel(3);
      } catch (error) {
        console.error("Error editing language:", error);
      }
    }
  };

  const startEdit = (language: LanguageItem) => {
    setEditingId(language.id || "");
    setEditName(language.name);
    setEditLevel(language.level);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditLevel(3);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>Languages</h3>
          {onAddLanguage && !isAdding && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsAdding(true)}
              style={{ color: highlightColor }}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add language</span>
            </Button>
          )}
        </div>
        
        {isAdding && (
          <div className="space-y-4 mb-4 p-4 border rounded-lg">
            <Input 
              value={newLanguage} 
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddLanguage();
                } else if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewLanguage("");
                  setNewLevel(3);
                }
              }}
              placeholder="Enter a language (e.g., Spanish, French)"
              className="h-9"
            />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level: {LEVEL_NAMES[newLevel - 1]}</span>
                <span>{newLevel}/5</span>
              </div>
              <Slider
                value={[newLevel]}
                onValueChange={([value]) => setNewLevel(value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9" 
                onClick={handleAddLanguage}
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
                onClick={() => {
                  setIsAdding(false);
                  setNewLanguage("");
                  setNewLevel(3);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {languages.map((language, index) => (
            <div key={language.id || index}>
              {editingId === language.id ? (
                <div className="space-y-4 p-4 border rounded-lg">
                  <Input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleEditLanguage(language.id || "");
                      } else if (e.key === "Escape") {
                        cancelEdit();
                      }
                    }}
                    placeholder="Language name"
                    className="h-9"
                  />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Level: {LEVEL_NAMES[editLevel - 1]}</span>
                      <span>{editLevel}/5</span>
                    </div>
                    <Slider
                      value={[editLevel]}
                      onValueChange={([value]) => setEditLevel(value)}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9" 
                      onClick={() => handleEditLanguage(language.id || "")}
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
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{language.name}</span>
                      <Badge 
                        variant="outline"
                        style={{ 
                          backgroundColor: `${highlightColor}15`,
                          borderColor: `${highlightColor}30`,
                          color: highlightColor
                        }}
                      >
                        {LEVEL_NAMES[language.level - 1]}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(language.level / 5) * 100}%`,
                            backgroundColor: highlightColor
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3">
                    {onEditLanguage && (
                      <button
                        onClick={() => startEdit(language)}
                        className="p-1 opacity-60 hover:opacity-100 transition-opacity"
                        style={{ color: highlightColor }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    {onRemoveLanguage && (
                      <button
                        onClick={() => onRemoveLanguage(language.id || "")}
                        className="p-1 opacity-60 hover:opacity-100 transition-opacity text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {languages.length === 0 && !isAdding && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No languages added yet</p>
            {onAddLanguage && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={() => setIsAdding(true)}
                style={{ color: highlightColor }}
              >
                Add your first language
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}