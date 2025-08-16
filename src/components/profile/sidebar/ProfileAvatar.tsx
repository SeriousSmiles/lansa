
import { useState, useRef } from "react";
import { Pencil, Upload, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleProfileImageUpload = async () => {
    if (onUploadProfileImage && selectedFile) {
      try {
        setIsUploading(true);
        await onUploadProfileImage(selectedFile);
        setIsUploadingImage(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        toast.success('Profile image updated successfully!');
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileSelect(event.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const closeModal = () => {
    setIsUploadingImage(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsDragOver(false);
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

      <Dialog open={isUploadingImage} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">Upload Profile Image</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFileDialog}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                ${isDragOver 
                  ? 'border-primary bg-primary/5 scale-105' 
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/20'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-full border-4 border-background shadow-lg"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedFile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    {isDragOver ? (
                      <Upload className="w-8 h-8 text-primary animate-bounce" />
                    ) : (
                      <Image className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {isDragOver ? 'Drop your image here' : 'Choose or drag an image'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  <Button variant="outline" className="pointer-events-none">
                    <Upload className="w-4 h-4 mr-2" />
                    Browse Files
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={closeModal}
                className="flex-1"
                disabled={isUploading}
              >
                Cancel
              </Button>
              {selectedFile && (
                <Button
                  onClick={handleProfileImageUpload}
                  className="flex-1"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
