import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen } from "lucide-react";
import { usePortalMode } from "@/hooks/usePortalMode";
import { PortalPageShell } from "@/components/dashboard/portal/PortalPageShell";

export default function Resources() {
  const { user } = useAuth();
  const { portalV2 } = usePortalMode();
  const userName = user?.email ? user.email.split("@")[0] : "Lansa User";

  const body = (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <div className="rounded-full bg-muted p-4 mb-4">
        <BookOpen className="h-10 w-10 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground max-w-md">
        We're preparing helpful resources, guides, and templates for you. Check back soon!
      </p>
    </div>
  );

  if (portalV2) {
    return (
      <PortalPageShell
        eyebrow="Library"
        title="Resources"
        subtitle="Guides, templates, and tools to support every step of your career journey."
      >
        {body}
      </PortalPageShell>
    );
  }

  return (
    <DashboardLayout userName={userName} email={user?.email || ""}>
      <div className="p-6 flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Resources</h1>
        <p className="text-muted-foreground max-w-md">
          We're preparing helpful resources, guides, and templates for you. Check back soon!
        </p>
      </div>
    </DashboardLayout>
  );
}
