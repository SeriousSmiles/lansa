
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditableUserNameProps {
  userName: string;
  onUpdateUserName?: (name: string) => Promise<void>;
}

export function EditableUserName({ 
  userName, 
  onUpdateUserName 
}: EditableUserNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(userName);

  const handleSave = async () => {
    if (onUpdateUserName) {
      try {
        await onUpdateUserName(editedName);
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating name:", error);
      }
    }
  };

  if (isEditing && onUpdateUserName) {
    return (
      <div className="w-full">
        <Input
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          placeholder="Your name"
          className="text-center text-lg"
        />
        <div className="flex space-x-2 mt-2 justify-center">
          <Button onClick={handleSave} size="sm" className="w-20">Save</Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setEditedName(userName);
              setIsEditing(false);
            }}
            className="w-20"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-center leading-tight break-words px-2">
        {userName}
      </h1>
      {onUpdateUserName && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute -right-2 sm:-right-6 top-0 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" 
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit name</span>
        </Button>
      )}
    </div>
  );
}
