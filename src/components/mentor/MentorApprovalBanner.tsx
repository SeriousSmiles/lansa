import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { MentorProfile } from "@/hooks/useMentorProfile";

interface MentorApprovalBannerProps {
  profile: MentorProfile | null | undefined;
}

export function MentorApprovalBanner({ profile }: MentorApprovalBannerProps) {
  if (!profile) return null;
  const status = profile.approval_status;

  if (status === "approved") return null;

  if (status === "pending") {
    return (
      <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="py-3 px-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">Account Pending Approval</p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
              Your mentor account is being reviewed by our team. You'll be able to upload and publish content once approved.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "rejected") {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="py-3 px-4 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">Account Not Approved</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your mentor application was not approved. Please update your profile and contact support if you have questions.
            </p>
            {profile.rejected_reason && (
              <p className="text-sm mt-2 p-2 rounded bg-destructive/10 text-destructive">
                <strong>Reason:</strong> {profile.rejected_reason}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
