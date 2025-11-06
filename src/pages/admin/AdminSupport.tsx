import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

export default function AdminSupport() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Admin Support
        </CardTitle>
        <CardDescription>
          Support resources and help documentation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Support center coming soon. This will provide access to help documentation, support tickets, and admin resources.
        </p>
      </CardContent>
    </Card>
  );
}
