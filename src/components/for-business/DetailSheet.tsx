import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

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

export function DetailSheet({ open, onOpenChange, content }: DetailSheetProps) {
  if (!content) return null;

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
      </SheetContent>
    </Sheet>
  );
}
