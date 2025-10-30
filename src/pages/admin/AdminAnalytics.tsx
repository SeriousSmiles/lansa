import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function AdminAnalytics() {
  return (
    <AdminLayout title="Analytics">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            User Analytics
          </CardTitle>
          <CardDescription>
            Distribution by color per user type, average time-to-certification, and recency buckets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Analytics dashboard coming soon. This will include distribution charts by color per user type, average time-to-certification metrics, and recency bucket analysis (0-7, 8-14, 15-30 days).
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
