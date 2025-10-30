import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, Mail, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PendingRequestBannerProps {
  organizationName?: string;
  requestSentAt?: string;
  onContactSupport?: () => void;
}

export function PendingRequestBanner({ 
  organizationName = "the organization",
  requestSentAt,
  onContactSupport
}: PendingRequestBannerProps) {
  const timeAgo = requestSentAt 
    ? formatDistanceToNow(new Date(requestSentAt), { addSuffix: true })
    : null;

  return (
    <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertTitle className="text-yellow-900 dark:text-yellow-100 flex items-center justify-between">
        <span>Membership Request Pending</span>
        {timeAgo && (
          <span className="text-sm font-normal text-yellow-700 dark:text-yellow-300">
            Sent {timeAgo}
          </span>
        )}
      </AlertTitle>
      <AlertDescription className="text-yellow-800 dark:text-yellow-200 space-y-3">
        <p>
          Your request to join <strong>{organizationName}</strong> is awaiting approval from an administrator.
        </p>
        
        <div className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Usually reviewed within 24-48 hours</span>
        </div>

        <div className="flex items-start gap-2 text-sm">
          <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>You'll receive an email notification once approved</span>
        </div>

        {onContactSupport && (
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onContactSupport}
              className="border-yellow-600 text-yellow-900 hover:bg-yellow-100 dark:text-yellow-100 dark:hover:bg-yellow-900"
            >
              Contact Administrator
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
