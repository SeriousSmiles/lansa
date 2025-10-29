import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock } from "lucide-react";

interface PendingRequestBannerProps {
  organizationName?: string;
}

export function PendingRequestBanner({ organizationName }: PendingRequestBannerProps) {
  return (
    <Alert className="mb-4 border-amber-500 bg-amber-50 dark:bg-amber-950">
      <Clock className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900 dark:text-amber-100">
        Request Pending Approval
      </AlertTitle>
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        Your request to join {organizationName || "the organization"} is awaiting approval from an administrator.
        You'll receive a notification once your request is reviewed.
      </AlertDescription>
    </Alert>
  );
}
