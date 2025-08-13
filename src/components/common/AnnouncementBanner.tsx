import { Info } from "lucide-react";

interface AnnouncementBannerProps {
  message?: string;
}

export function AnnouncementBanner({
  message = "You are seeing an early version of Lansa. What you see is subject to change.",
}: AnnouncementBannerProps) {
  return (
    <aside
      role="status"
      aria-live="polite"
      className="w-full border-b border-border bg-primary/10 text-foreground"
    >
      <div className="mx-auto max-w-screen-2xl px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
          <Info className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{message}</span>
        </div>
      </div>
    </aside>
  );
}
