
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
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Toast notification is handled in the parent component
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
            Anyone with this link can view your profile without needing to sign in.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input 
              value={shareUrl} 
              readOnly 
              className="flex-grow p-2 border rounded"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button onClick={copyToClipboard}>Copy</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
