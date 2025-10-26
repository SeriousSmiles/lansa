import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DragDropImageUpload } from "@/components/upload/DragDropImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2, X } from "lucide-react";

interface CompanyLogoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  companyName?: string;
  onSuccess?: () => void;
}

export function CompanyLogoUploadModal({ 
  open, 
  onOpenChange, 
  userId,
  companyName,
  onSuccess 
}: CompanyLogoUploadModalProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a JPG, PNG, or WebP image' };
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 2MB' };
    }

    return { valid: true };
  };

  const handleUpload = async () => {
    if (!logoFile) {
      toast.error("Please select a logo to upload");
      return;
    }

    // Validate file
    const validation = validateFile(logoFile);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);
    try {
      // Create secure file path with user ID to prevent conflicts
      const fileExt = logoFile.name.split('.').pop();
      const timestamp = Date.now();
      const sanitizedFileName = logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `company-logos/${userId}/${timestamp}-${sanitizedFileName}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: false // Prevent overwriting existing files
        });
        
      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        if (uploadError.message?.includes('row-level security') || 
            uploadError.message?.includes('policy')) {
          toast.error("Storage permissions need to be configured. Please contact support.");
        } else {
          toast.error("Failed to upload logo. Please try again.");
        }
        return;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);
        
      const logoUrl = data.publicUrl;

      // Update business_onboarding_data
      const { error: dataError } = await supabase
        .from('business_onboarding_data')
        .update({ 
          company_logo: logoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (dataError) {
        console.error('Error updating business data:', dataError);
        toast.error("Failed to save logo. Please try again.");
        return;
      }

      // Mark that logo has been uploaded in user_answers to track completion
      await supabase
        .from('user_answers')
        .update({ 
          onboarding_inputs: { 
            company_logo_uploaded: true,
            company_logo_uploaded_at: new Date().toISOString()
          }
        })
        .eq('user_id', userId);

      toast.success("Company logo uploaded successfully!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = async () => {
    // Mark as skipped so we don't show this again
    try {
      await supabase
        .from('user_answers')
        .update({ 
          onboarding_inputs: { 
            company_logo_skipped: true,
            company_logo_skipped_at: new Date().toISOString()
          }
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error marking logo as skipped:', error);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl">Add Your Company Logo</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-2">
            {companyName ? `Upload a logo for ${companyName}` : 'Upload your company logo'} to make your job listings stand out. You can skip this and add it later from your profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <DragDropImageUpload
              onImageSelect={(file) => setLogoFile(file)}
              onImageRemove={() => setLogoFile(null)}
              currentImageUrl=""
              acceptedSize="400x400"
              maxFileSizeKB={2048}
              aspectRatio="square"
            />
            <p className="text-xs text-muted-foreground text-center">
              Recommended: Square format (400x400px), max 2MB
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleUpload}
              disabled={!logoFile || isUploading}
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload Logo"}
            </Button>
            <Button 
              variant="ghost"
              onClick={handleSkip}
              disabled={isUploading}
              className="w-full"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
