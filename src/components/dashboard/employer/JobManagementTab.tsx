import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Eye, MoreHorizontal } from "lucide-react";
import { JobPostingDialog } from "./JobPostingDialog";
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

export function JobManagementTab() {
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const { user } = useAuth();

  const loadJobListings = async () => {
    if (!user?.id) return;

    try {
      // First get the business profile
      const { data: businessProfile, error: profileError } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching business profile:', profileError);
        return;
      }

      if (!businessProfile) {
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

          if (createError) {
            console.error('Error creating business profile:', createError);
            return;
          }
          
          // Use the new profile ID to fetch jobs (will be empty initially)
          setJobListings([]);
          return;
        }
      } else {
        // Fetch job listings for this business
        const { data: jobs, error: jobsError } = await supabase
          .from('job_listings')
          .select('*')
          .eq('business_id', businessProfile.id)
          .order('created_at', { ascending: false });

        if (jobsError) {
          console.error('Error fetching job listings:', jobsError);
          toast.error('Failed to load job listings');
        } else {
          setJobListings(jobs || []);
        }
      }
    } catch (error) {
      console.error('Error loading job listings:', error);
      toast.error('Failed to load job listings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobListings();
  }, [user?.id]);

  const handleCreateJob = () => {
    setEditingJob(null);
    setIsDialogOpen(true);
  };

  const handleEditJob = (job: JobListing) => {
    setEditingJob(job);
    setIsDialogOpen(true);
  };

  const handleJobSaved = () => {
    loadJobListings();
    setIsDialogOpen(false);
    setEditingJob(null);
  };

  const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('job_listings')
        .update({ is_active: !currentStatus })
        .eq('id', jobId);

      if (error) throw error;

      toast.success(`Job ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadJobListings();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-subheading text-muted-foreground animate-pulse">Loading job listings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-heading text-foreground">Job Listings</h2>
          <p className="text-caption">Manage your active job postings</p>
        </div>
        <Button onClick={handleCreateJob}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {jobListings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-subheading text-foreground">No job listings yet</h3>
                <p className="text-caption">Create your first job posting to start attracting candidates</p>
              </div>
              <Button onClick={handleCreateJob}>
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Job
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {jobListings.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <Badge variant={job.is_active ? "default" : "secondary"}>
                        {job.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#666666]">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span className="capitalize">{job.mode}</span>
                      <span>•</span>
                      <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <p className="text-[#666666] line-clamp-2">{job.description}</p>
                  
                  {job.top_skills && job.top_skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.top_skills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.top_skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.top_skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditJob(job)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Applications
                    </Button>
                    <Button
                      variant={job.is_active ? "outline" : "primary"}
                      size="sm"
                      onClick={() => toggleJobStatus(job.id, job.is_active)}
                    >
                      {job.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <JobPostingDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onJobSaved={handleJobSaved}
        editingJob={editingJob}
      />
    </div>
  );
}