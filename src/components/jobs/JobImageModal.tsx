import { X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface JobImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  jobTitle: string;
}

export function JobImageModal({ isOpen, onClose, imageUrl, jobTitle }: JobImageModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={jobTitle}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
      >
        <X className="h-5 w-5" />
      </Button>
      <img
        src={imageUrl}
        alt={jobTitle}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[95vw] max-h-[90vh] w-auto h-auto object-contain"
      />
    </div>
  );
}
