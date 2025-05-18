
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ShareProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
}

export function ShareProfileDialog({ 
  isOpen, 
  onOpenChange,
  shareUrl
}: ShareProfileDialogProps) {
  const [isCopied, setIsCopied] = useState(false);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000); // Reset after 3 seconds
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share your profile</DialogTitle>
          <DialogDescription>
            Anyone with this link can view your personalized professional profile without needing to sign in.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input 
              value={shareUrl} 
              readOnly 
              className="flex-grow p-2 border rounded text-sm"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button onClick={copyToClipboard}>
              {isCopied ? "Copied!" : "Copy"}
            </Button>
          </div>
          {isCopied && (
            <div className="text-sm text-center text-green-600 font-medium">
              Link copied to clipboard!
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            Your profile link is personalized with your name but will always work even if you change your display name later.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
