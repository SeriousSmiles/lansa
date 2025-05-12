
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ProfileAvatarProps {
  userName: string;
  profileImage?: string;
  onUploadProfileImage?: (file: File) => Promise<string>;
}

export function ProfileAvatar({ 
  userName, 
  profileImage, 
  onUploadProfileImage 
}: ProfileAvatarProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onUploadProfileImage && event.target.files && event.target.files[0]) {
      try {
        await onUploadProfileImage(event.target.files[0]);
        setIsUploadingImage(false);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  return (
    <div className="relative group">
      {profileImage ? (
        <Avatar className="w-24 h-24 border-4 border-white">
          <AvatarImage src={profileImage} alt={userName} />
          <AvatarFallback className="bg-[#FF6B4A] text-white text-4xl font-bold">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-24 h-24 rounded-full bg-[#FF6B4A] border-4 border-white flex items-center justify-center text-white text-4xl font-bold">
          {userName.charAt(0).toUpperCase()}
        </div>
      )}
      
      {onUploadProfileImage && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute bottom-0 right-0 h-8 w-8 p-0 bg-white shadow rounded-full" 
          onClick={() => setIsUploadingImage(true)}
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Change profile image</span>
        </Button>
      )}

      <Dialog open={isUploadingImage} onOpenChange={setIsUploadingImage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Profile Image</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="picture">Choose a profile picture</Label>
              <Input
                id="picture"
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadingImage(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
