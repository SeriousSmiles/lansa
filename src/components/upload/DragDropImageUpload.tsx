import { useState, useRef, useCallback } from "react";
import { Upload, X, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DragDropImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  currentImageUrl?: string;
  acceptedSize?: string;
  maxFileSizeKB?: number;
  className?: string;
  aspectRatio?: "square" | "wide";
}

export function DragDropImageUpload({
  onImageSelect,
  onImageRemove,
  currentImageUrl,
  acceptedSize = "1080x1080",
  maxFileSizeKB = 2048,
  className,
  aspectRatio = "square"
}: DragDropImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = useCallback((file: File) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, JPEG, etc.)",
        variant: "destructive",
      });
      return false;
    }

    // Check file size
    if (file.size > maxFileSizeKB * 1024) {
      toast({
        title: "File too large",
        description: `Please upload an image smaller than ${maxFileSizeKB}KB`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [maxFileSizeKB, toast]);

  const handleFileSelect = useCallback((file: File) => {
    if (!validateFile(file)) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageSelect(file);

    toast({
      title: "Image uploaded",
      description: "Your image has been successfully uploaded.",
    });
  }, [validateFile, onImageSelect, toast]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveImage = useCallback(() => {
    setPreviewUrl(null);
    onImageRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageRemove]);

  const displayUrl = previewUrl || currentImageUrl;
  const aspectClasses = aspectRatio === "square" ? "aspect-square" : "aspect-[1080/540]";

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {displayUrl ? (
        <div className={cn("relative w-full rounded-lg border border-border bg-muted overflow-hidden", aspectClasses)}>
          <img
            src={displayUrl}
            alt="Uploaded preview"
            className="w-full h-full object-cover"
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 hover:text-red-700 border-red-200"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "relative w-full rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:border-muted-foreground/50 transition-colors cursor-pointer",
            aspectClasses,
            isDragging && "border-primary bg-primary/10"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
            <div className="rounded-full bg-muted p-3">
              {isDragging ? (
                <Upload className="h-6 w-6 text-primary animate-bounce" />
              ) : (
                <Image className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {isDragging ? "Drop your image here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-muted-foreground">
                Recommended size: {acceptedSize} • Max: {maxFileSizeKB}KB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}