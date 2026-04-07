import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

export interface DetailContent {
  title: string;
  description: string;
  bullets?: string[];
  stat?: string;
}

interface DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: DetailContent | null;
}

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

function DetailBody({ content }: { content: DetailContent }) {
  return (
    <div className="mt-6 space-y-4">
      {content.stat && (
        <div className="rounded-lg bg-[hsl(var(--lansa-muted))] p-4 text-center">
          <p className="text-3xl font-bold text-[hsl(var(--lansa-blue))] font-['Urbanist']">
            {content.stat}
          </p>
        </div>
      )}
      {content.bullets && content.bullets.length > 0 && (
        <ul className="space-y-3">
          {content.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-foreground">
              <span className="mt-1 h-2 w-2 rounded-full bg-[hsl(var(--lansa-orange))] shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DetailSheet({ open, onOpenChange, content }: DetailSheetProps) {
  const isSmall = useIsSmallViewport();

  if (!content) return null;

  if (isSmall) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="pb-4 border-b text-left">
            <DrawerTitle className="text-xl font-bold font-['Urbanist'] text-[hsl(var(--foreground))]">
              {content.title}
            </DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">
              {content.description}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">
            <DetailBody content={content} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[440px] sm:max-w-[440px] overflow-y-auto bg-white">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-xl font-bold font-['Urbanist'] text-[hsl(var(--foreground))]">
            {content.title}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {content.description}
          </SheetDescription>
        </SheetHeader>
        <DetailBody content={content} />
      </SheetContent>
    </Sheet>
  );
}
