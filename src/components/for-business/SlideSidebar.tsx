import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const SLIDE_TITLES = [
  "Welcome",
  "The Problem",
  "How It Works",
  "Certification",
  "Features",
  "Comparison",
  "Your Insight",
  "Pricing",
  "Get Started",
];

function useIsSmallViewport() {
  const [isSmall, setIsSmall] = useState(() => window.innerWidth <= 1024);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1024px)");
    const onChange = () => setIsSmall(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isSmall;
}

interface SlideSidebarProps {
  currentSlide: number;
  onSelectSlide: (index: number) => void;
  open: boolean;
  onToggle: () => void;
}

export function SlideSidebar({ currentSlide, onSelectSlide, open, onToggle }: SlideSidebarProps) {
  const isSmall = useIsSmallViewport();

  const slideList = (
    <div className={cn(
      isSmall ? "grid grid-cols-3 gap-2 p-4" : "flex-1 overflow-y-auto p-2 space-y-1"
    )}>
      {SLIDE_TITLES.map((title, i) => (
        <button
          key={i}
          onClick={() => { onSelectSlide(i); if (isSmall) onToggle(); }}
          className={cn(
            "text-left rounded-md text-xs font-medium transition-colors flex items-center gap-2",
            isSmall ? "min-h-[44px] px-3 py-2" : "w-full px-3 py-2.5",
            currentSlide === i
              ? "bg-[hsl(var(--lansa-blue))] text-white"
              : "text-foreground hover:bg-accent"
          )}
        >
          <span className={cn(
            "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0",
            currentSlide === i ? "bg-white/20" : "bg-muted/20"
          )}>
            {i + 1}
          </span>
          {title}
        </button>
      ))}
    </div>
  );

  if (isSmall) {
    return (
      <Drawer open={open} onOpenChange={(isOpen) => { if (!isOpen) onToggle(); }}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Slides</DrawerTitle>
          </DrawerHeader>
          {slideList}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <>
      {!open && (
        <button
          onClick={onToggle}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 backdrop-blur border border-border rounded-r-lg p-2 shadow-md hover:bg-white transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
      )}

      <div
        className={cn(
          "absolute left-0 top-0 h-full z-20 bg-white/95 backdrop-blur-md border-r border-border shadow-xl transition-transform duration-300 flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ width: 200 }}
      >
        <div className="flex items-center justify-between p-3 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Slides</span>
          <button onClick={onToggle} className="p-1 hover:bg-accent rounded">
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
        </div>
        {slideList}
      </div>
    </>
  );
}
