import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { employerDataService } from "./employerDataService";

export interface JobListing {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  location?: string;
  top_skills: string[];
  mode: 'employee' | 'internship';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  job_image?: string;
}

export interface JobFormData {
  title: string;
  description: string;
  location: string;
  jobType: string;
  workType: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  requirements: string[];
  benefits: string[];
  skills: string[];
  experienceLevel: string;
  isRemote: boolean;
  isActive: boolean;
  targetUserTypes: string[];
  category: string;
  expiresAt?: string;
  jobImage?: File | null;
  jobImageUrl?: string;
}

export const jobPostingService = {
  async getJobListings(userId: string): Promise<JobListing[]> {
    try {
      // First get the business profile
      const businessProfile = await employerDataService.getBusinessProfile(userId);
      
      if (!businessProfile) {
        return [];
      }

      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .eq('business_id', businessProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching job listings:', error);
      toast.error("Failed to load job listings");
      return [];
    }
  },

  async createJobListing(userId: string, jobData: JobFormData): Promise<JobListing | null> {
    try {
      // Get or create business profile
      let businessProfile = await employerDataService.getBusinessProfile(userId);
      
      if (!businessProfile) {
        // Create a basic business profile if none exists
        businessProfile = await employerDataService.createBusinessProfile({
          user_id: userId,
          company_name: jobData.title.split(' ')[0] + ' Company', // Temporary company name
          industry: 'Technology',
          company_size: 'Startup'
        });

        if (!businessProfile) {
          throw new Error('Failed to create business profile');
        }
      }

      // Handle image upload if provided
      let imageUrl = jobData.jobImageUrl || null;
      if (jobData.jobImage) {
        const fileExt = jobData.jobImage.name.split('.').pop();
        const fileName = `${userId}-job-${Date.now()}.${fileExt}`;
        const filePath = `job-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('user-uploads')
          .upload(filePath, jobData.jobImage);
          
        if (uploadError) {
          console.error('Error uploading job image:', uploadError);
          toast.error("Failed to upload job image");
        } else {
          const { data: urlData } = supabase.storage
            .from('user-uploads')
            .getPublicUrl(filePath);
          imageUrl = urlData.publicUrl;
        }
      }

      // Get or create company entry
      let companyId = businessProfile.id; // Fallback to business_id
      
      // Check if company exists for this business profile
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('name', businessProfile.company_name)
        .single();

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        // Create company entry
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: businessProfile.company_name,
            industry: businessProfile.industry || 'Technology',
            size: businessProfile.company_size || 'startup',
            location: businessProfile.location || null
          })
          .select('id')
          .single();

        if (!companyError && newCompany) {
          companyId = newCompany.id;
        }
      }

      // Normalize job type to match enum values
      const normalizeJobType = (type: string): 'full_time' | 'part_time' | 'contract' | 'internship' => {
        const normalized = type.toLowerCase().replace(/\s+/g, '_');
        const validTypeMap: { [key: string]: 'full_time' | 'part_time' | 'contract' | 'internship' } = {
          'full_time': 'full_time',
          'full-time': 'full_time',
          'part_time': 'part_time',
          'part-time': 'part_time',
          'contract': 'contract',
          'temporary': 'contract',
          'internship': 'internship'
        };
        return validTypeMap[normalized] || 'full_time';
      };

      // Format salary range
      const salaryRange = (jobData.salaryMin || jobData.salaryMax) 
        ? `${jobData.currency} ${jobData.salaryMin || '0'} - ${jobData.salaryMax || 'Competitive'}`
        : null;

      // Insert into job_listings_v2 (the table used by job seekers)
      const jobListingData = {
        company_id: companyId,
        created_by: userId,
        title: jobData.title,
        description: this.formatJobDescription(jobData),
        location: jobData.location,
        category: jobData.category,
        job_type: normalizeJobType(jobData.jobType),
        is_active: jobData.isActive,
        target_user_types: jobData.targetUserTypes,
        skills_required: jobData.skills,
        is_remote: jobData.isRemote || jobData.workType === 'Remote',
        salary_range: salaryRange,
        expires_at: jobData.expiresAt || null,
        image_url: imageUrl
      };

      const { data, error } = await supabase
        .from('job_listings_v2')
        .insert([jobListingData])
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Job posted successfully!");
      return data as any; // Type compatibility
    } catch (error) {
      console.error('Error creating job listing:', error);
      toast.error("Failed to create job listing");
      return null;
    }
  },

  async updateJobListing(jobId: string, updates: Partial<JobListing>): Promise<JobListing | null> {
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Job updated successfully!");
      return data;
    } catch (error) {
      console.error('Error updating job listing:', error);
      toast.error("Failed to update job listing");
      return null;
    }
  },

  async deleteJobListing(jobId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('job_listings')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      
      toast.success("Job deleted successfully");
      return true;
    } catch (error) {
      console.error('Error deleting job listing:', error);
      toast.error("Failed to delete job listing");
      return false;
    }
  },

  async toggleJobStatus(jobId: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('job_listings')
        .update({ is_active: isActive })
        .eq('id', jobId);

      if (error) throw error;
      
      toast.success(`Job ${isActive ? 'activated' : 'deactivated'} successfully`);
      return true;
    } catch (error) {
      console.error('Error toggling job status:', error);
      toast.error("Failed to update job status");
      return false;
    }
  },

  // Format job description from form data
  formatJobDescription(jobData: JobFormData): string {
    let description = jobData.description + '\n\n';
    
    if (jobData.requirements.length > 0) {
      description += '**Requirements:**\n';
      jobData.requirements.forEach(req => {
        description += `• ${req}\n`;
      });
      description += '\n';
    }
    
    if (jobData.benefits.length > 0) {
      description += '**Benefits:**\n';
      jobData.benefits.forEach(benefit => {
        description += `• ${benefit}\n`;
      });
      description += '\n';
    }
    
    if (jobData.salaryMin || jobData.salaryMax) {
      description += `**Compensation:** `;
      if (jobData.salaryMin && jobData.salaryMax) {
        description += `${jobData.currency} ${jobData.salaryMin} - ${jobData.salaryMax}`;
      } else if (jobData.salaryMin) {
        description += `From ${jobData.currency} ${jobData.salaryMin}`;
      } else if (jobData.salaryMax) {
        description += `Up to ${jobData.currency} ${jobData.salaryMax}`;
      }
      description += '\n\n';
    }
    
    if (jobData.experienceLevel) {
      description += `**Experience Level:** ${jobData.experienceLevel}\n`;
    }
    
    if (jobData.workType) {
      description += `**Work Type:** ${jobData.workType}\n`;
    }
    
    return description;
  },

  // Real-time subscription for job listings
  subscribeToJobListings(businessId: string, callback: (payload: any) => void) {
    return supabase
      .channel('job-listings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_listings',
          filter: `business_id=eq.${businessId}`
        },
        callback
      )
      .subscribe();
  }
};