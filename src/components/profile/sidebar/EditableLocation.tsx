import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Check, X } from "lucide-react";

interface EditableLocationProps {
  location?: string;
  onUpdateLocation?: (location: string) => Promise<void>;
  highlightColor?: string;
}

export function EditableLocation({
  location = "",
  onUpdateLocation,
  highlightColor = "#FF6B4A"
}: EditableLocationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLocation, setEditedLocation] = useState(location);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onUpdateLocation) return;
    
    setIsSaving(true);
    try {
      await onUpdateLocation(editedLocation);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedLocation(location);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: highlightColor }} />
        <Input
          value={editedLocation}
          onChange={(e) => setEditedLocation(e.target.value)}
          placeholder="City, Country or Remote"
          className="text-sm h-8"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          autoFocus
        />
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handleSave}
          disabled={isSaving}
          className="h-8 w-8 p-0"
        >
          <Check className="h-4 w-4" style={{ color: highlightColor }} />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handleCancel}
          disabled={isSaving}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors mt-2"
      onClick={() => onUpdateLocation && setIsEditing(true)}
    >
      <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: highlightColor }} />
      <span>{location || "Add location"}</span>
    </div>
  );
}
