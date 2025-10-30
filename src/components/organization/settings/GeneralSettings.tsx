/**
 * General Organization Settings
 * Manage organization name, logo, industry, description, etc.
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrgPermissions } from "@/contexts/OrganizationContext";
import { organizationService } from "@/services/organizationService";
import { toast } from "sonner";
import { Loader2, Building2 } from "lucide-react";
import { DragDropImageUpload } from "@/components/upload/DragDropImageUpload";
import { supabase } from "@/integrations/supabase/client";

export function GeneralSettings() {
  const { activeOrganization, refreshOrganization } = useOrganization();
  const { canManageOrgSettings } = useOrgPermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    name: activeOrganization?.name || "",
    industry: activeOrganization?.industry || "",
    size_range: activeOrganization?.size_range || "",
    description: activeOrganization?.description || "",
    website: activeOrganization?.website || "",
    domain: activeOrganization?.domain || "",
  });

  const handleLogoUpload = async () => {
    if (!logoFile || !activeOrganization) return;

    setIsUploadingLogo(true);
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `company-logos/${activeOrganization.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, logoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      await organizationService.updateOrganization(activeOrganization.id, {
        logo_url: publicUrl
      });

      await refreshOrganization();
      setLogoFile(null);
      toast.success("Organization logo updated successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization || !canManageOrgSettings) return;

    setIsSubmitting(true);
    try {
      await organizationService.updateOrganization(activeOrganization.id, formData);
      await refreshOrganization();
      toast.success("Organization settings updated successfully");
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error("Failed to update organization settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Logo</CardTitle>
          <CardDescription>
            Upload your organization's logo. This will appear in job listings and organization search results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Current Logo Preview */}
            {activeOrganization?.logo_url && (
              <div className="flex-shrink-0 w-full sm:w-auto">
                <p className="text-sm font-medium mb-2">Current Logo</p>
                <div className="w-[250px] h-[250px] rounded-lg border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
                  <img 
                    src={activeOrganization.logo_url} 
                    alt={activeOrganization.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Upload Controls */}
            <div className="w-full sm:max-w-[250px] space-y-4">
              <DragDropImageUpload
                onImageSelect={setLogoFile}
                onImageRemove={() => setLogoFile(null)}
                acceptedSize="250x250"
                maxFileSizeKB={2048}
                aspectRatio="square"
              />
              
              {logoFile && (
                <Button 
                  type="button"
                  onClick={handleLogoUpload}
                  disabled={isUploadingLogo || !canManageOrgSettings}
                  className="w-full"
                >
                  {isUploadingLogo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload Logo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>
            Update your organization's basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!canManageOrgSettings}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                disabled={!canManageOrgSettings}
                placeholder="e.g., Technology, Finance"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size_range">Company Size</Label>
              <Input
                id="size_range"
                value={formData.size_range}
                onChange={(e) => setFormData({ ...formData, size_range: e.target.value })}
                disabled={!canManageOrgSettings}
                placeholder="e.g., 1-10, 11-50, 51-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={!canManageOrgSettings}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                disabled={!canManageOrgSettings}
                placeholder="example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!canManageOrgSettings}
              placeholder="Tell us about your organization..."
              rows={4}
            />
          </div>

          {canManageOrgSettings && (
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase 3.3: Ownership Transfer - Danger Zone */}
      {useOrgPermissions().isOwner && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that will affect organization ownership
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between p-4 border border-destructive/20 rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Transfer Ownership</p>
                <p className="text-sm text-muted-foreground">
                  Transfer full ownership of this organization to another admin. You will become an admin.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => toast.info('Ownership transfer feature - Coming soon')}
              >
                Transfer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
