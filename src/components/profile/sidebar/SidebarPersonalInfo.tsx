
import { Card } from "@/components/ui/card";
import { ProfileAvatar } from "./ProfileAvatar";
import { EditableUserName } from "./EditableUserName";
import { EditableTitle } from "./EditableTitle";
import { ContactInfo } from "./ContactInfo";

interface SidebarPersonalInfoProps {
  userName: string;
  role: string;
  email: string;
  title?: string;
  phoneNumber?: string;
  profileImage?: string;
  highlightColor?: string;
  onUpdateUserName?: (name: string) => Promise<void>;
  onUpdateTitle?: (title: string) => Promise<void>;
  onUpdatePhoneNumber?: (phone: string) => Promise<void>;
  onUploadProfileImage?: (file: File) => Promise<string>;
}

export function SidebarPersonalInfo({
  userName,
  role,
  email,
  title = "",
  phoneNumber,
  profileImage,
  highlightColor = "#FF6B4A",
  onUpdateUserName,
  onUpdateTitle,
  onUpdatePhoneNumber,
  onUploadProfileImage
}: SidebarPersonalInfoProps) {
  return (
    <Card className="overflow-hidden">
      <div 
        className="h-20 sm:h-24" 
        style={{ backgroundColor: highlightColor }}
      ></div>
      <div className="p-4 sm:p-6 pt-0 -mt-10 sm:-mt-12">
        {/* Profile Avatar - Centered */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <ProfileAvatar
            userName={userName}
            profileImage={profileImage}
            onUploadProfileImage={onUploadProfileImage}
          />
        </div>
        
        {/* User Info - Better spacing and positioning */}
        <div className="w-full text-center space-y-2">
          <EditableUserName
            userName={userName}
            onUpdateUserName={onUpdateUserName}
          />
          
          <div className="flex flex-col items-center gap-1">
            <p className="font-medium text-lg" style={{ color: highlightColor }}>
              {role}
            </p>
            
            <EditableTitle
              title={title}
              onUpdateTitle={onUpdateTitle}
              highlightColor={highlightColor}
            />
          </div>
        </div>
        
        {/* Contact Info - Separate section with better spacing */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <ContactInfo
            email={email}
            phoneNumber={phoneNumber}
            onUpdatePhoneNumber={onUpdatePhoneNumber}
            highlightColor={highlightColor}
          />
        </div>
      </div>
    </Card>
  );
}
