import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminHistorical() {
  return (
    <AdminLayout 
      title="Historical Data"
      actions={
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historical Color States
          </CardTitle>
          <CardDescription>
            Export CSV snapshots of color states by day/week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Historical data export coming soon. This will allow you to export CSV files with color state snapshots by day or week for trend analysis.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
