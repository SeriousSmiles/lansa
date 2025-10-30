import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function AdminTrends() {
  return (
    <AdminLayout title="Trends">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            User Color Trends
          </CardTitle>
          <CardDescription>
            Track color distribution changes over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Trends visualization coming soon. This will show stacked color areas over time, filtered by user type.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
