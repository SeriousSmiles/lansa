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
      console.log("Creating job listing for user:", userId);
      
      // Get or create business profile to get company_id
      let businessProfile = await employerDataService.getBusinessProfile(userId);
      
      if (!businessProfile) {
        // Create a basic business profile if none exists
        businessProfile = await employerDataService.createBusinessProfile({
          user_id: userId,
          company_name: jobData.title.split(' ')[0] + ' Company',
          industry: 'Technology',
          company_size: 'Startup'
        });

        if (!businessProfile) {
          throw new Error('Failed to create business profile');
        }
      }

      const companyId = businessProfile.id;
      const companyName = businessProfile.company_name;

      // Check if company exists in companies table, if not create it
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('id', companyId)
        .maybeSingle();

      if (!existingCompany) {
        console.log("Creating company entry...");
        await supabase
          .from('companies')
          .insert([{
            id: companyId,
            name: companyName || 'My Company',
          }]);
      }

      // Handle image upload if provided
      let imageUrl: string | null = null;
      if (jobData.jobImage) {
        console.log("Uploading job image...");
        const fileExt = jobData.jobImage.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `job-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('user-uploads')
          .upload(filePath, jobData.jobImage, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Failed to upload job image");
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('user-uploads')
            .getPublicUrl(filePath);
          imageUrl = publicUrl;
          console.log("Image uploaded successfully:", imageUrl);
        }
      }

      // Format the job description with requirements and benefits
      const formattedDescription = this.formatJobDescription(jobData);

      // Normalize job type to match database enum (only 4 types supported in job_listings_v2)
      type JobType = 'full_time' | 'part_time' | 'contract' | 'internship';
      const normalizeJobType = (type: string): JobType => {
        const normalized = type.toLowerCase().replace(/[\s-]/g, '_');
        // Map temporary and volunteer to contract as fallback
        if (normalized === 'temporary' || normalized === 'volunteer') {
          return 'contract';
        }
        const validTypes: JobType[] = ['full_time', 'part_time', 'contract', 'internship'];
        return validTypes.includes(normalized as JobType) ? (normalized as JobType) : 'full_time';
      };

      // Prepare salary range string
      let salaryRange: string | null = null;
      if (jobData.salaryMin && jobData.salaryMax && jobData.currency) {
        salaryRange = `${jobData.currency} ${jobData.salaryMin} - ${jobData.salaryMax}`;
      } else if (jobData.salaryMin) {
        salaryRange = `From ${jobData.currency} ${jobData.salaryMin}`;
      } else if (jobData.salaryMax) {
        salaryRange = `Up to ${jobData.currency} ${jobData.salaryMax}`;
      }

      // Prepare job listing data for job_listings_v2
      const jobListingData = {
        company_id: companyId,
        title: jobData.title,
        description: formattedDescription,
        category: jobData.category || 'Other',
        job_type: normalizeJobType(jobData.jobType),
        target_user_types: jobData.targetUserTypes || [],
        image_url: imageUrl || jobData.jobImageUrl || null,
        skills_required: jobData.skills || [],
        location: jobData.location || null,
        salary_range: salaryRange,
        is_remote: jobData.isRemote || jobData.workType === 'Remote',
        expires_at: jobData.expiresAt || null,
        created_by: userId,
        is_active: jobData.isActive !== false,
      };

      console.log("Inserting job listing into job_listings_v2:", jobListingData);

      const { data, error } = await supabase
        .from('job_listings_v2')
        .insert([jobListingData])
        .select()
        .single();

      if (error) {
        console.error("Error creating job listing:", error);
        throw error;
      }

      console.log("Job listing created successfully:", data);
      toast.success("Job listing posted successfully!");
      return data as any;
    } catch (error) {
      console.error('Error in createJobListing:', error);
      toast.error("Failed to create job listing. Please try again.");
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