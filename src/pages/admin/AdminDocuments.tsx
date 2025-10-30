import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function AdminDocuments() {
  return (
    <AdminLayout title="Documents">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            System Documentation
          </CardTitle>
          <CardDescription>
            Read-only access to system documentation and policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Document library coming soon. This will provide read-only access to system documentation, policies, and guides.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
