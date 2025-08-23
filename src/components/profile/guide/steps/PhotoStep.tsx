import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Upload, CheckCircle } from "lucide-react";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { StepContainer } from "./StepContainer";

interface PhotoStepProps {
  profile: ProfileDataReturn;
  userId: string;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function PhotoStep({ profile, onNext, onPrevious, isFirst, isLast }: PhotoStepProps) {
  const [uploading, setUploading] = useState(false);
  const hasPhoto = !!profile.profileImage;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile.uploadProfileImage) return;

    setUploading(true);
    try {
      await profile.uploadProfileImage(file);
    } catch (error) {
      console.error('Failed to upload photo:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <StepContainer
      title="Add Your Profile Photo"
      description="A professional photo helps you make a great first impression"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirst={isFirst}
      isLast={isLast}
      isCompleted={hasPhoto}
    >
      <div className="space-y-6">
        {/* Current Photo Display */}
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-border">
              <AvatarImage src={profile.profileImage} alt={profile.userName} />
              <AvatarFallback className="text-2xl bg-muted">
                {profile.userName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            {hasPhoto && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {hasPhoto ? "Update Photo" : "Upload Photo"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <div className="space-y-4">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Choose a clear, professional-looking photo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: JPG, PNG (max 5MB)
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload"
                    disabled={uploading}
                  />
                  <Button asChild disabled={uploading}>
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      {uploading ? "Uploading..." : hasPhoto ? "Change Photo" : "Select Photo"}
                    </label>
                  </Button>
                </div>
              </div>
            </div>

            {/* Photo Tips */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Photo Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use good lighting with your face clearly visible</li>
                <li>• Look directly at the camera with a friendly expression</li>
                <li>• Dress professionally for your industry</li>
                <li>• Keep the background simple and uncluttered</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {hasPhoto && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-full">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Photo uploaded successfully!</span>
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
}