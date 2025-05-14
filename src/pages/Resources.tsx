
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Resources() {
  const { user } = useAuth();
  const userName = user?.email ? user.email.split('@')[0] : "Lansa User";
  
  return (
    <DashboardLayout userName={userName} email={user?.email || ""}>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Resources</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Branding Guide</CardTitle>
              <CardDescription>For professionals seeking visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Learn how to create a professional brand that stands out in your industry.</p>
              <Button variant="outline">Download PDF</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Clarity Workbook</CardTitle>
              <CardDescription>Define your professional path</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">A step-by-step workbook to help you gain clarity on your professional goals.</p>
              <Button variant="outline">Access Workbook</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Communication Templates</CardTitle>
              <CardDescription>Talk about your work effectively</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Ready-to-use templates to help you describe your skills and experience.</p>
              <Button variant="outline">View Templates</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
