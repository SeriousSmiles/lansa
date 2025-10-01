import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface JobListing {
  id: string;
  title: string;
  description: string;
  location: string;
  mode: string;
  is_active: boolean;
  top_skills: string[];
  target_user_types?: string[];
  category?: string;
  job_type?: string;
  is_remote?: boolean;
  salary_range?: string;
  expires_at?: string;
  created_at: string;
}

interface JobPostingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onJobSaved: () => void;
  editingJob?: JobListing | null;
}

const USER_TYPES = [
  { value: "student", label: "Students", description: "University/college students looking for opportunities" },
  { value: "job_seeker", label: "Job Seekers", description: "Active professionals seeking new positions" },
  { value: "freelancer", label: "Freelancers", description: "Independent contractors and consultants" },
  { value: "entrepreneur", label: "Entrepreneurs", description: "Business owners and startup founders" },
  { value: "visionary", label: "Visionaries", description: "Strategic thinkers and innovators" }
];

const JOB_CATEGORIES = [
  "Engineering", "Marketing", "Design", "Sales", "Product", 
  "Operations", "Finance", "Human Resources", "Customer Success", "Data Science"
];

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Temporary"];

export function JobPostingDialog({ isOpen, onClose, onJobSaved, editingJob }: JobPostingDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    jobType: "",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    skills: [] as string[],
    newSkill: "",
    targetUserTypes: [] as string[],
    isRemote: false,
    expiresAt: undefined as Date | undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title,
        description: editingJob.description,
        location: editingJob.location,
        category: editingJob.category || "",
        jobType: editingJob.job_type || "",
        salaryMin: "",
        salaryMax: "",
        currency: "USD",
        skills: editingJob.top_skills || [],
        newSkill: "",
        targetUserTypes: editingJob.target_user_types || [],
        isRemote: editingJob.is_remote || false,
        expiresAt: editingJob.expires_at ? new Date(editingJob.expires_at) : undefined
      });
    } else {
      setFormData({
        title: "",
        description: "",
        location: "",
        category: "",
        jobType: "",
        salaryMin: "",
        salaryMax: "",
        currency: "USD",
        skills: [],
        newSkill: "",
        targetUserTypes: [],
        isRemote: false,
        expiresAt: undefined
      });
    }
  }, [editingJob, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: ""
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const toggleUserType = (userType: string) => {
    setFormData(prev => ({
      ...prev,
      targetUserTypes: prev.targetUserTypes.includes(userType)
        ? prev.targetUserTypes.filter(t => t !== userType)
        : [...prev.targetUserTypes, userType]
    }));
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    
    setIsSubmitting(true);
    try {
      let { data: businessProfile, error: profileError } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        const { data: businessData } = await supabase
          .from('business_onboarding_data')
          .select('company_name, business_services')
          .eq('user_id', user.id)
          .single();

        if (businessData) {
          const { data: newProfile, error: createError } = await supabase
            .from('business_profiles')
            .insert({
              user_id: user.id,
              company_name: businessData.company_name,
              industry: businessData.business_services
            })
            .select('id')
            .single();

          if (createError) throw createError;
          businessProfile = newProfile;
        } else {
          throw new Error('Business profile not found');
        }
      } else if (profileError) {
        throw profileError;
      }

      const salaryRange = (formData.salaryMin || formData.salaryMax)
        ? `${formData.currency} ${formData.salaryMin || '0'} - ${formData.salaryMax || 'Competitive'}`
        : null;

      const jobData = {
        business_id: businessProfile.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        category: formData.category,
        job_type: formData.jobType.toLowerCase().replace(/\s+/g, '_'),
        mode: 'employee' as const,
        top_skills: formData.skills,
        target_user_types: formData.targetUserTypes,
        is_remote: formData.isRemote,
        salary_range: salaryRange,
        expires_at: formData.expiresAt ? formData.expiresAt.toISOString() : null,
        is_active: true
      };

      if (editingJob) {
        const { error } = await supabase
          .from('job_listings')
          .update(jobData)
          .eq('id', editingJob.id);

        if (error) throw error;
        toast.success("Job updated successfully!");
      } else {
        const { error } = await supabase
          .from('job_listings')
          .insert(jobData);

        if (error) throw error;
        toast.success("Job posted successfully!");
      }

      onJobSaved();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error("Failed to save job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.title && formData.description && formData.location && 
                      formData.category && formData.jobType && formData.targetUserTypes.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingJob ? "Edit Job Listing" : "Post New Job"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g. Frontend Developer"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="jobType">Job Type *</Label>
              <Select value={formData.jobType} onValueChange={(value) => handleInputChange('jobType', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Target Audience * <span className="text-xs text-muted-foreground">(Select all that apply)</span></Label>
            <div className="mt-2 space-y-3">
              {USER_TYPES.map((userType) => (
                <div key={userType.value} className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                  <Checkbox
                    id={userType.value}
                    checked={formData.targetUserTypes.includes(userType.value)}
                    onCheckedChange={() => toggleUserType(userType.value)}
                  />
                  <div className="flex-1">
                    <label htmlFor={userType.value} className="font-medium cursor-pointer">
                      {userType.label}
                    </label>
                    <p className="text-xs text-muted-foreground">{userType.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the role, responsibilities, and requirements..."
              className="mt-1 min-h-32"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g. New York, NY"
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="isRemote"
                checked={formData.isRemote}
                onCheckedChange={(checked) => handleInputChange('isRemote', checked)}
              />
              <Label htmlFor="isRemote" className="cursor-pointer">Remote Work Available</Label>
            </div>
          </div>

          <div>
            <Label>Salary Range (Optional)</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <Input
                value={formData.salaryMin}
                onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                placeholder="Min"
                type="number"
              />
              <Input
                value={formData.salaryMax}
                onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                placeholder="Max"
                type="number"
              />
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Expiration Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !formData.expiresAt && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expiresAt ? format(formData.expiresAt, "PPP") : "Select expiration date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.expiresAt}
                  onSelect={(date) => handleInputChange('expiresAt', date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="skills">Required Skills</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="newSkill"
                value={formData.newSkill}
                onChange={(e) => handleInputChange('newSkill', e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} disabled={!formData.newSkill.trim()}>
                Add
              </Button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting} size="sm">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90"
              size="sm"
            >
              {isSubmitting ? "Saving..." : editingJob ? "Update Job" : "Post Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
