/**
 * Phase 3.2: Organization Creation Flow
 * Allows CEO/Founder/HR Manager to create a new organization
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { organizationService } from "@/services/organizationService";
import { useOrganization } from "@/contexts/OrganizationContext";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";

interface OrganizationOnboardingFormProps {
  onComplete: () => void;
}

export function OrganizationOnboardingForm({ onComplete }: OrganizationOnboardingFormProps) {
  const { user } = useAuth();
  const { refreshOrganization } = useOrganization();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [duplicateWarning, setDuplicateWarning] = useState<string>('');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size_range: '',
    description: '',
    logo_url: '',
    website: '',
    domain: '',
    country: '',
    city: '',
  });

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Hospitality',
    'Real Estate',
    'Marketing',
    'Other',
  ];

  const sizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees',
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const checkDuplicateName = async (name: string) => {
    if (name.length < 3) {
      setDuplicateWarning('');
      return;
    }

    try {
      const results = await organizationService.searchOrganizations(name);
      if (results.length > 0) {
        setDuplicateWarning(
          `${results.length} organization(s) with similar name found. Please add location details to help users distinguish your company.`
        );
      } else {
        setDuplicateWarning('');
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("You must be logged in to create an organization");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Organization name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create organization
      const { organization, membership } = await organizationService.createOrganization({
        name: formData.name,
        industry: formData.industry || undefined,
        size_range: formData.size_range || undefined,
        description: formData.description || undefined,
        website: formData.website || undefined,
        domain: formData.domain || undefined,
        country: formData.country || undefined,
        city: formData.city || undefined,
      });

      toast.success(`${organization.name} created successfully!`);
      
      // Refresh organization context
      await refreshOrganization();
      
      // Wait for React state to propagate
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Complete onboarding
      onComplete();
    } catch (error: any) {
      console.error("Error creating organization:", error);
      toast.error(error.message || "Failed to create organization. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Create Your Organization</h1>
        <p className="text-muted-foreground">
          Set up your company profile to start hiring and managing your team
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Tell us about your company. You can always update this later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Acme Corporation"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={(e) => checkDuplicateName(e.target.value)}
                required
              />
              {duplicateWarning && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ {duplicateWarning}
                </p>
              )}
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleInputChange('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company Size */}
            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Select
                value={formData.size_range}
                onValueChange={(value) => handleInputChange('size_range', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">About Your Company</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your company..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourcompany.com"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>

            {/* Domain (for email matching) */}
            <div className="space-y-2">
              <Label htmlFor="domain">Company Email Domain</Label>
              <Input
                id="domain"
                placeholder="e.g., yourcompany.com"
                value={formData.domain}
                onChange={(e) => handleInputChange('domain', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Team members with this email domain can request to join automatically
              </p>
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="e.g., Kenya, United States"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City/Region</Label>
                <Input
                  id="city"
                  placeholder="e.g., Nairobi, New York"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Organization'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
