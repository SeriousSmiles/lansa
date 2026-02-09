import { Info, X } from "lucide-react";
import { useState } from "react";

interface AnnouncementBannerProps {
  message?: string;
}

export function AnnouncementBanner({
  message = "You are seeing an early version of Lansa. What you see is subject to change.",
}: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("banner_dismissed") === "true"
  );

  const handleDismiss = () => {
    sessionStorage.setItem("banner_dismissed", "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="w-full border-b border-border bg-primary/10 text-foreground"
    >
      <div className="mx-auto max-w-screen-2xl px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm relative">
          <Info className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{message}</span>
          <button
            onClick={handleDismiss}
            className="absolute right-0 p-1 rounded-full hover:bg-primary/10 transition-colors"
            aria-label="Dismiss notice"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </aside>
  );
}
