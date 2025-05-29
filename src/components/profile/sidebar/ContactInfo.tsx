
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone } from "lucide-react";
import { EditablePhoneNumber } from "./EditablePhoneNumber";

interface ContactInfoProps {
  email: string;
  phoneNumber?: string;
  onUpdatePhoneNumber?: (phone: string) => Promise<void>;
  highlightColor?: string;
}

export function ContactInfo({ 
  email, 
  phoneNumber, 
  onUpdatePhoneNumber,
  highlightColor = "#FF6B4A"
}: ContactInfoProps) {
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  return (
    <div className="w-full mt-4 space-y-2">
      {/* Display email as read-only with icon */}
      <div className="flex items-center gap-2 text-sm">
        <Mail className="h-4 w-4" style={{ color: highlightColor }} />
        <span>{email}</span>
      </div>
      
      {(phoneNumber || onUpdatePhoneNumber) && (
        <div className="flex items-start gap-2 text-sm">
          <Phone className="h-4 w-4 mt-1" style={{ color: highlightColor }} />
          
          {isEditingPhone ? (
            <EditablePhoneNumber 
              phoneNumber={phoneNumber || ""}
              onSave={async (phone) => {
                if (onUpdatePhoneNumber) {
                  await onUpdatePhoneNumber(phone);
                }
                setIsEditingPhone(false);
              }}
              onCancel={() => setIsEditingPhone(false)}
            />
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span>{phoneNumber || "No phone number"}</span>
              {onUpdatePhoneNumber && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => setIsEditingPhone(true)}
                  style={{ color: highlightColor }}
                >
                  {phoneNumber ? "Edit" : "Add"}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
