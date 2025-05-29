
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SharedProfileSidebar } from "./SharedProfileSidebar";

interface CollapsibleSharedSidebarProps {
  userName: string;
  role: string;
  goal: string;
  blocker: string;
  userSkills: string[];
  profileImage: string;
  phoneNumber?: string;
  userEmail?: string;
  userTitle?: string;
  coverColor?: string;
  highlightColor?: string;
  professionalGoal?: string;
  biggestChallenge?: string;
}

export function CollapsibleSharedSidebar(props: CollapsibleSharedSidebarProps) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Mobile version with sheet
  if (isMobile) {
    return (
      <>
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="fixed top-4 left-4 z-50 lg:hidden"
              style={{
                backgroundColor: `${props.highlightColor}10`,
                borderColor: props.highlightColor,
                color: props.highlightColor,
              }}
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <div className="p-4">
              <SharedProfileSidebar {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop version with collapsible sidebar
  return (
    <>
      {/* Sidebar toggle button for desktop */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
        className="fixed top-4 left-4 z-50 hidden lg:flex"
        style={{
          backgroundColor: `${props.highlightColor}10`,
          borderColor: props.highlightColor,
          color: props.highlightColor,
        }}
      >
        {isDesktopSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {/* Desktop sidebar */}
      <div
        className={`lg:col-span-4 transition-all duration-300 ease-in-out ${
          isDesktopSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:absolute lg:z-40'
        }`}
      >
        <SharedProfileSidebar {...props} />
      </div>
    </>
  );
}
