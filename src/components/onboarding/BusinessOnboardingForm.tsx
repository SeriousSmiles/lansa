import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BusinessOnboardingFormProps {
  onComplete: () => void;
}

export function BusinessOnboardingForm({ onComplete }: BusinessOnboardingFormProps) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    businessSize: "",
    roleFunction: "",
    businessServices: "",
    jobListings: []
  });

  const businessSizes = [
    "1-10 employees",
    "11-50 employees", 
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees"
  ];

  const roleFunctions = [
    "CEO/Founder",
    "HR Director",
    "Hiring Manager", 
    "Recruiter",
    "Operations Manager",
    "Other"
  ];

  const businessServices = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing", 
    "Retail",
    "Consulting",
    "Marketing",
    "Other"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    
    setIsSubmitting(true);
    try {
      // Save business onboarding data
      const { error: businessError } = await supabase
        .from('business_onboarding_data')
        .upsert({
          user_id: user.id,
          company_name: formData.companyName,
          business_size: formData.businessSize,
          role_function: formData.roleFunction,
          business_services: formData.businessServices,
          open_job_listings: formData.jobListings
        });

      if (businessError) throw businessError;

      // Create business profile (handle existing profiles)
      const { error: profileError } = await supabase
        .from('business_profiles')
        .upsert({
          user_id: user.id,
          company_name: formData.companyName,
          company_size: formData.businessSize,
          description: `Role: ${formData.roleFunction}. Services: ${formData.businessServices}`,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      // Add business role (handle existing roles)
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'business'
        }, {
          onConflict: 'user_id,role',
          ignoreDuplicates: true
        });

      // Don't let role errors block completion if role already exists
      if (roleError && roleError.code !== '23505') {
        throw roleError;
      }

      // Update user_answers with user_type
      const { error: userError } = await supabase
        .from('user_answers')
        .upsert({
          user_id: user.id,
          user_type: 'employer',
          career_path_onboarding_completed: true
        }, {
          onConflict: 'user_id'
        });

      if (userError) throw userError;

      // Update user profile to mark onboarding as completed
      const { error: userProfileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (userProfileError) throw userProfileError;

      toast.success("Business profile created successfully!");
      onComplete();
    } catch (error) {
      console.error('Error saving business data:', error);
      toast.error("Failed to save business information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-[#2E2E2E]">Company Information</CardTitle>
              <p className="text-[#666666]">Tell us about your company</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter your company name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="businessSize">Company Size</Label>
                <Select value={formData.businessSize} onValueChange={(value) => handleInputChange('businessSize', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessSizes.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-[#2E2E2E]">Your Role</CardTitle>
              <p className="text-[#666666]">What's your function in the company?</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="roleFunction">Role & Function</Label>
                <Select value={formData.roleFunction} onValueChange={(value) => handleInputChange('roleFunction', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleFunctions.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-[#2E2E2E]">Business Services</CardTitle>
              <p className="text-[#666666]">What industry are you in?</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessServices">Industry</Label>
                <Select value={formData.businessServices} onValueChange={(value) => handleInputChange('businessServices', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessServices.map((service) => (
                      <SelectItem key={service} value={service}>{service}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-[#2E2E2E]">All Set!</CardTitle>
              <p className="text-[#666666]">Ready to start finding great talent?</p>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="text-sm text-[#666666]">
                <p>You can add job listings from your dashboard once you're set up.</p>
                <p className="mt-2">Our AI will help match you with the best candidates.</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] w-full">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-[#FF6B4A] text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div 
                  className={`w-12 h-0.5 ${
                    step < currentStep ? 'bg-[#FF6B4A]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {renderStep()}

      <div className="flex gap-4 mt-8">
        {currentStep > 1 && (
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
        )}
        
        {currentStep < 4 ? (
          <Button 
            onClick={handleNext}
            disabled={
              (currentStep === 1 && (!formData.companyName || !formData.businessSize)) ||
              (currentStep === 2 && !formData.roleFunction) ||
              (currentStep === 3 && !formData.businessServices)
            }
            className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90"
          >
            Next
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90"
          >
            {isSubmitting ? "Setting up..." : "Complete Setup"}
          </Button>
        )}
      </div>
    </div>
  );
}