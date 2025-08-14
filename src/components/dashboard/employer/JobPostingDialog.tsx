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
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface JobListing {
  id: string;
  title: string;
  description: string;
  location: string;
  mode: string;
  is_active: boolean;
  top_skills: string[];
  created_at: string;
}

interface JobPostingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onJobSaved: () => void;
  editingJob?: JobListing | null;
}

export function JobPostingDialog({ isOpen, onClose, onJobSaved, editingJob }: JobPostingDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    mode: "",
    skills: [] as string[],
    newSkill: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title,
        description: editingJob.description,
        location: editingJob.location,
        mode: editingJob.mode,
        skills: editingJob.top_skills || [],
        newSkill: ""
      });
    } else {
      setFormData({
        title: "",
        description: "",
        location: "",
        mode: "",
        skills: [],
        newSkill: ""
      });
    }
  }, [editingJob, isOpen]);

  const handleInputChange = (field: string, value: string) => {
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

  const handleSubmit = async () => {
    if (!user?.id) return;
    
    setIsSubmitting(true);
    try {
      // Get or create business profile
      let { data: businessProfile, error: profileError } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Create business profile if it doesn't exist
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

      const jobData = {
        business_id: businessProfile.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        mode: 'employee' as const,
        top_skills: formData.skills,
        is_active: true
      };

      if (editingJob) {
        // Update existing job
        const { error } = await supabase
          .from('job_listings')
          .update(jobData)
          .eq('id', editingJob.id);

        if (error) throw error;
        toast.success("Job updated successfully!");
      } else {
        // Create new job
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

  const isFormValid = formData.title && formData.description && formData.location && formData.mode;

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
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g. Frontend Developer"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Job Description</Label>
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
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g. New York, NY"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="mode">Work Mode</Label>
              <Select value={formData.mode} onValueChange={(value) => handleInputChange('mode', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="on_site">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90"
            >
              {isSubmitting ? "Saving..." : editingJob ? "Update Job" : "Post Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}