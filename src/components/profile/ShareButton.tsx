
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ShareButtonProps {
  userId: string | undefined;
}

export function ShareButton({ userId }: ShareButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const { toast } = useToast();

  const handleShare = () => {
    if (!userId) return;
    
    // Generate a shareable URL
    const shareableUrl = `${window.location.origin}/profile/share/${userId}`;
    setShareUrl(shareableUrl);
    setIsDialogOpen(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "The shareable profile link has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to clipboard. Please copy it manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button
        onClick={handleShare}
        className="flex items-center gap-2 px-4"
        variant="outline"
      >
        <Share size={16} />
        <span>Share Profile</span>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share your profile</DialogTitle>
            <DialogDescription>
              Anyone with this link can view your profile without needing to sign in.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="flex-grow"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button onClick={copyToClipboard}>Copy</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
