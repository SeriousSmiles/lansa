
import { Mail, MapPin } from "lucide-react";
import { EditablePhoneNumber } from "./EditablePhoneNumber";

interface ContactInfoProps {
  email: string;
  phoneNumber?: string;
  onUpdatePhoneNumber?: (phone: string) => Promise<void>;
}

export function ContactInfo({ 
  email, 
  phoneNumber, 
  onUpdatePhoneNumber 
}: ContactInfoProps) {
  return (
    <div className="w-full mt-6 space-y-4">
      <div className="flex items-center">
        <Mail className="h-5 w-5 text-[#FF6B4A] mr-3" />
        <span>{email || 'email@example.com'}</span>
      </div>
      <div className="flex items-center">
        <MapPin className="h-5 w-5 text-[#FF6B4A] mr-3" />
        <span>Remote / Worldwide</span>
      </div>
      <EditablePhoneNumber 
        phoneNumber={phoneNumber}
        onUpdatePhoneNumber={onUpdatePhoneNumber}
      />
    </div>
  );
}
