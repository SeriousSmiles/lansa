import { BookOpen } from "lucide-react";
import { PortalPageShell } from "@/components/dashboard/portal/PortalPageShell";

export default function Resources() {
  return (
    <PortalPageShell
      eyebrow="Library"
      title="Resources"
      subtitle="Guides, templates, and tools to support every step of your career journey."
    >
      <div className="flex flex-col items-center justify-center text-center py-24">
        <div className="rounded-full bg-muted p-4 mb-4">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground max-w-md">
          We're preparing helpful resources, guides, and templates for you. Check back soon!
        </p>
      </div>
    </PortalPageShell>
  );
}
