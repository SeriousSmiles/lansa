import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  jobTitle: string;
}

export function JobImageModal({ isOpen, onClose, imageUrl, jobTitle }: JobImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black/95 border-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="w-full flex items-center justify-center p-4 sm:p-8">
          <img
            src={imageUrl}
            alt={jobTitle}
            className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
