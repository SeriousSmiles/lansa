
import { useState } from "react";
import { Phone, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditablePhoneNumberProps {
  phoneNumber?: string;
  onUpdatePhoneNumber?: (phone: string) => Promise<void>;
}

export function EditablePhoneNumber({ 
  phoneNumber = '', 
  onUpdatePhoneNumber 
}: EditablePhoneNumberProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPhone, setEditedPhone] = useState(phoneNumber);

  const handleSave = async () => {
    if (onUpdatePhoneNumber) {
      try {
        await onUpdatePhoneNumber(editedPhone);
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating phone number:", error);
      }
    }
  };

  return (
    <div className="flex items-center group relative">
      <Phone className="h-5 w-5 text-[#FF6B4A] mr-3" />
      {isEditing ? (
        <div className="flex-1">
          <Input
            value={editedPhone}
            onChange={(e) => setEditedPhone(e.target.value)}
            placeholder="Your phone number"
            className="text-sm h-8"
          />
          <div className="flex space-x-2 mt-2">
            <Button onClick={handleSave} size="sm" className="h-7 text-xs">Save</Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setEditedPhone(phoneNumber);
                setIsEditing(false);
              }}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <span>{phoneNumber || 'Add your phone number'}</span>
          {onUpdatePhoneNumber && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" 
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3 w-3" />
              <span className="sr-only">Edit phone</span>
            </Button>
          )}
        </>
      )}
    </div>
  );
}
