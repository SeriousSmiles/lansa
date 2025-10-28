import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { JobPostingDialog } from "./JobPostingDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrgPermissions } from "@/contexts/OrganizationContext";
import { toast } from "sonner";
import { ApplicationsSheet } from "@/components/employer/ApplicationsSheet";
import { jobPostingService } from "@/services/jobPostingService";

interface JobListing {
  id: string;
  title: string;
  description: string;
  location: string;
  is_active: boolean;
  skills_required?: any;
  target_user_types?: any;
  category?: string;
  job_type?: string;
  salary_range?: string;
  posted_at: string;
  company_id: string;
  image_url?: string;
}

export function JobManagementTab() {
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const { user } = useAuth();
  const { activeOrganization } = useOrganization();
  const { canCreateJobs, canEditJobs, canDeleteJobs } = useOrgPermissions();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>("");
  const [showApplicationsSheet, setShowApplicationsSheet] = useState(false);

  const loadJobListings = async () => {
    if (!activeOrganization?.id) return;

    try {
      // ✅ FIXED: Query jobs by organization_id (all team members see org jobs)
      const { data: jobs, error: jobsError } = await supabase
        .from('job_listings_v2')
        .select('*')
        .eq('organization_id', activeOrganization.id)
        .order('posted_at', { ascending: false });

      if (jobsError) {
        console.error('Error fetching job listings:', jobsError);
        toast.error('Failed to load job listings');
      } else {
        setJobListings(jobs || []);
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
  }, [activeOrganization?.id, user?.id]);

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
        .from('job_listings_v2')
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

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const success = await jobPostingService.deleteJobListing(jobId);
      if (success) {
        loadJobListings();
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[#666666] animate-pulse">Loading job listings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#2E2E2E]">Job Listings</h2>
          <p className="text-[#666666]">Manage your organization's job postings</p>
        </div>
        {canCreateJobs && (
          <Button onClick={handleCreateJob} className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        )}
      </div>

      {jobListings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2E2E2E]">No job listings yet</h3>
                <p className="text-[#666666]">Create your first job posting to start attracting candidates</p>
              </div>
              <Button onClick={handleCreateJob} className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90">
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Job
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobListings.map((job) => (
            <Card key={job.id}>
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
                      {job.job_type && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
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
                  
                  {job.skills_required && Array.isArray(job.skills_required) && job.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.skills_required.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {typeof skill === 'string' ? skill : skill.name || skill}
                        </Badge>
                      ))}
                      {job.skills_required.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills_required.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-2">
                    {canEditJobs && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditJob(job)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedJobId(job.id);
                      setSelectedJobTitle(job.title);
                      setShowApplicationsSheet(true);
                    }}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Applications
                    </Button>
                    {canEditJobs && (
                      <Button
                        variant={job.is_active ? "outline" : "primary"}
                        size="sm"
                        onClick={() => toggleJobStatus(job.id, job.is_active)}
                      >
                        {job.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    )}
                    {canDeleteJobs && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
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

      {selectedJobId && (
        <ApplicationsSheet
          jobId={selectedJobId}
          jobTitle={selectedJobTitle}
          open={showApplicationsSheet}
          onOpenChange={setShowApplicationsSheet}
        />
      )}
    </div>
  );
}