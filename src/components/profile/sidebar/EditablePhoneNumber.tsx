
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditablePhoneNumberProps {
  phoneNumber?: string;
  onUpdatePhoneNumber?: (phone: string) => Promise<void>;
  onSave?: (phone: string) => Promise<void>;
  onCancel?: () => void;
}

export function EditablePhoneNumber({ 
  phoneNumber = '', 
  onUpdatePhoneNumber,
  onSave,
  onCancel
}: EditablePhoneNumberProps) {
  const [editedPhone, setEditedPhone] = useState(phoneNumber);

  const handleSave = async () => {
    if (onUpdatePhoneNumber) {
      try {
        await onUpdatePhoneNumber(editedPhone);
      } catch (error) {
        console.error("Error updating phone number:", error);
      }
    }
    
    if (onSave) {
      try {
        await onSave(editedPhone);
      } catch (error) {
        console.error("Error saving phone number:", error);
      }
    }
  };

  const handleCancel = () => {
    setEditedPhone(phoneNumber);
    if (onCancel) {
      onCancel();
    }
  };

  return (
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
          onClick={handleCancel}
          className="h-7 text-xs"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
