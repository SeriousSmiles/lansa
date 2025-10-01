import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { useEffect } from "react";

export default function NotAllowed() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    from?: { pathname: string };
    required?: string[];
    current?: string;
    careerPath?: string;
  } | null;

  useEffect(() => {
    // Log unauthorized access attempt for analytics
    console.warn("Unauthorized access attempt:", {
      attempted: state?.from?.pathname,
      required: state?.required,
      current: state?.current,
      timestamp: new Date().toISOString(),
    });
  }, [state]);

  const getDashboardPath = () => {
    if (state?.current === 'employer') return '/employer-dashboard';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-destructive/10 p-4">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-3">Access Restricted</h1>
        
        <p className="text-muted-foreground mb-4">
          This area is restricted to{" "}
          <span className="font-semibold text-foreground">
            {state?.required?.join(" or ") || "specific user types"}
          </span>{" "}
          only.
        </p>

        {state?.current && (
          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Your current account type:</p>
            <p className="font-semibold text-foreground capitalize">
              {state.current}
              {state.careerPath && ` (${state.careerPath})`}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={() => navigate(getDashboardPath())} 
            className="w-full"
          >
            Go to My Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)} 
            className="w-full"
          >
            Go Back
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          If you believe this is an error, please contact support.
        </p>
      </Card>
    </div>
  );
}
