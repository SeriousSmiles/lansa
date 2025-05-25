
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export function EmptyInsightsState() {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
        <h3 className="text-xl font-semibold mb-2">You're All Caught Up!</h3>
        <p className="text-gray-600 mb-4">
          Great job! You're making excellent progress with your professional presence.
        </p>
        <p className="text-sm text-gray-500">
          New insights will appear here as you continue using Lansa.
        </p>
      </CardContent>
    </Card>
  );
}
