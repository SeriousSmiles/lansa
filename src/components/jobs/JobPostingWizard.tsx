import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, X, Plus } from "lucide-react";
import { DragDropImageUpload } from "@/components/upload/DragDropImageUpload";
import { gsap } from "gsap";
import { jobPostingService, JobFormData } from "@/services/jobPostingService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface JobPostingWizardProps {
  onComplete: () => void;
  onCancel: () => void;
  initialData?: Partial<JobFormData>;
  userId: string;
  organizationId: string;
  variant?: "mobile" | "desktop";
}

interface JobStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  validation: () => boolean;
}

export function JobPostingWizard({ 
  onComplete, 
  onCancel, 
  initialData = {},
  userId,
  organizationId,
  variant = "desktop"
}: JobPostingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobData, setJobData] = useState<JobFormData>({
    title: initialData.title || "",
    location: initialData.location || "",
    jobType: initialData.jobType || "",
    workType: initialData.workType || "",
    salaryMin: initialData.salaryMin || "",
    salaryMax: initialData.salaryMax || "",
    currency: initialData.currency || "USD",
    description: initialData.description || "",
    requirements: initialData.requirements || [],
    benefits: initialData.benefits || [],
    skills: initialData.skills || [],
    experienceLevel: initialData.experienceLevel || "",
    isRemote: initialData.isRemote || false,
    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
    targetUserTypes: initialData.targetUserTypes || [],
    category: initialData.category || "",
    expiresAt: initialData.expiresAt || undefined,
    jobImage: null,
    jobImageUrl: initialData.jobImageUrl || ""
  });

  const [newRequirement, setNewRequirement] = useState("");
  const [newBenefit, setNewBenefit] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const contentRef = useRef<HTMLDivElement>(null);

  const jobTypes = ["Full-time", "Part-time", "Contract", "Temporary", "Internship"];
  const workTypes = ["On-site", "Remote", "Hybrid"];
  const experienceLevels = ["Entry Level", "Mid Level", "Senior Level", "Executive"];
  const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "XCG"];
  const categories = ["Engineering", "Marketing", "Design", "Sales", "Product", "Operations", "Finance", "Human Resources", "Customer Success", "Data Science"];
  const userTypes = [
    { value: "student", label: "Students" },
    { value: "job_seeker", label: "Job Seekers" },
    { value: "freelancer", label: "Freelancers" },
    { value: "entrepreneur", label: "Entrepreneurs" },
    { value: "visionary", label: "Visionaries" }
  ];

  const updateJobData = (field: keyof JobFormData, value: any) => {
    setJobData(prev => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: 'requirements' | 'benefits' | 'skills', value: string, setter: (value: string) => void) => {
    if (value.trim() && !jobData[field].includes(value.trim())) {
      updateJobData(field, [...jobData[field], value.trim()]);
      setter("");
    }
  };

  const removeFromArray = (field: 'requirements' | 'benefits' | 'skills', index: number) => {
    const newArray = [...jobData[field]];
    newArray.splice(index, 1);
    updateJobData(field, newArray);
  };

  const toggleUserType = (userType: string) => {
    const newTypes = jobData.targetUserTypes.includes(userType)
      ? jobData.targetUserTypes.filter(t => t !== userType)
      : [...jobData.targetUserTypes, userType];
    updateJobData('targetUserTypes', newTypes);
  };

  const steps: JobStep[] = [
    {
      id: "target_audience",
      title: "Target Audience",
      description: "Who is this job for?",
      validation: () => jobData.targetUserTypes.length > 0,
      component: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Select all user types that would be a good fit for this position</p>
          {userTypes.map((userType) => (
            <div
              key={userType.value}
              onClick={() => toggleUserType(userType.value)}
              className={cn(
                "p-4 rounded-lg border-2 cursor-pointer transition-all",
                jobData.targetUserTypes.includes(userType.value)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{userType.label}</span>
                {jobData.targetUserTypes.includes(userType.value) && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "basics",
      title: "Job Basics",
      description: "Let's start with the essential details",
      validation: () => jobData.title.length > 0 && jobData.jobType.length > 0 && jobData.location.length > 0 && jobData.category.length > 0,
      component: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-base font-medium">Job Title *</Label>
            <Input
              id="title"
              value={jobData.title}
              onChange={(e) => updateJobData('title', e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              className={cn("mt-2 text-base", variant === "mobile" && "h-12")}
            />
          </div>

          <div>
            <Label htmlFor="jobType" className="text-base font-medium">Job Type *</Label>
            <Select value={jobData.jobType} onValueChange={(value) => updateJobData('jobType', value)}>
              <SelectTrigger className={cn("mt-2 text-base", variant === "mobile" && "h-12")}>
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                {jobTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location" className="text-base font-medium">Location *</Label>
            <Input
              id="location"
              value={jobData.location}
              onChange={(e) => updateJobData('location', e.target.value)}
              placeholder="e.g. New York, NY or Remote"
              className={cn("mt-2 text-base", variant === "mobile" && "h-12")}
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-base font-medium">Category *</Label>
            <Select value={jobData.category} onValueChange={(value) => updateJobData('category', value)}>
              <SelectTrigger className={cn("mt-2 text-base", variant === "mobile" && "h-12")}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="workType" className="text-base font-medium">Work Type</Label>
            <Select value={jobData.workType} onValueChange={(value) => updateJobData('workType', value)}>
              <SelectTrigger className={cn("mt-2 text-base", variant === "mobile" && "h-12")}>
                <SelectValue placeholder="Select work type" />
              </SelectTrigger>
              <SelectContent>
                {workTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      id: "compensation",
      title: "Compensation",
      description: "Set the salary range for this position",
      validation: () => true,
      component: (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Salary Range (Optional)</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <Input
                  value={jobData.salaryMin}
                  onChange={(e) => updateJobData('salaryMin', e.target.value)}
                  placeholder="Min"
                  type="number"
                  className={cn("text-base", variant === "mobile" && "h-12")}
                />
              </div>
              <div>
                <Input
                  value={jobData.salaryMax}
                  onChange={(e) => updateJobData('salaryMax', e.target.value)}
                  placeholder="Max"
                  type="number"
                  className={cn("text-base", variant === "mobile" && "h-12")}
                />
              </div>
              <div>
                <Select value={jobData.currency} onValueChange={(value) => updateJobData('currency', value)}>
                  <SelectTrigger className={cn("text-base", variant === "mobile" && "h-12")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="experienceLevel" className="text-base font-medium">Experience Level</Label>
            <Select value={jobData.experienceLevel} onValueChange={(value) => updateJobData('experienceLevel', value)}>
              <SelectTrigger className={cn("mt-2 text-base", variant === "mobile" && "h-12")}>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevels.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      id: "description",
      title: "Job Description",
      description: "Describe the role and responsibilities",
      validation: () => jobData.description.length > 0,
      component: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="description" className="text-base font-medium">Job Description *</Label>
            <Textarea
              id="description"
              value={jobData.description}
              onChange={(e) => updateJobData('description', e.target.value)}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              className="mt-2 min-h-32 text-base"
              rows={6}
            />
          </div>
        </div>
      )
    },
    {
      id: "job_image",
      title: "Job Image",
      description: "Add a visual to attract candidates (optional)",
      validation: () => true,
      component: (
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Job Vacancy Image (Optional)</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Upload an image (1080x1080px) to make your job listing stand out
            </p>
            <DragDropImageUpload
              onImageSelect={(file) => {
                updateJobData('jobImage', file);
              }}
              onImageRemove={() => {
                updateJobData('jobImage', null);
                updateJobData('jobImageUrl', '');
              }}
              currentImageUrl={jobData.jobImageUrl}
              acceptedSize="1080x1080"
              maxFileSizeKB={2048}
              aspectRatio="square"
            />
          </div>
        </div>
      )
    },
    {
      id: "requirements",
      title: "Requirements & Skills",
      description: "What skills and experience are needed?",
      validation: () => jobData.requirements.length > 0 || jobData.skills.length > 0,
      component: (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Requirements</Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add a requirement"
                  className="h-10 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('requirements', newRequirement, setNewRequirement);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => addToArray('requirements', newRequirement, setNewRequirement)}
                  disabled={!newRequirement.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobData.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {req}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFromArray('requirements', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">Skills</Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  className="h-10 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('skills', newSkill, setNewSkill);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => addToArray('skills', newSkill, setNewSkill)}
                  disabled={!newSkill.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFromArray('skills', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "benefits",
      title: "Benefits & Perks",
      description: "What benefits do you offer?",
      validation: () => true,
      component: (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Benefits & Perks (Optional)</Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Add a benefit"
                  className="h-10 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('benefits', newBenefit, setNewBenefit);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => addToArray('benefits', newBenefit, setNewBenefit)}
                  disabled={!newBenefit.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobData.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {benefit}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFromArray('benefits', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3 }
      );
    }
  }, [currentStep]);

  const handleNext = async () => {
    const step = steps[currentStep];
    if (!step.validation()) {
      toast.error(`Please complete all required fields in ${step.title}`);
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await jobPostingService.createJobListing(userId, organizationId, jobData);
      if (result) {
        toast.success("Job posted successfully! 🎉", { duration: 5000 });
        onComplete();
      }
    } catch (error) {
      console.error('Job submission error:', error);
      toast.error("Failed to post job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* Progress Bar */}
      <div className="w-full bg-muted h-1 mb-6">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold">{currentStepData.title}</h3>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
      </div>

      {/* Step Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto mb-6">
        {currentStepData.component}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handlePrevious}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 0 ? "Cancel" : "Previous"}
        </Button>
        <Button
          onClick={handleNext}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Posting..." : currentStep === steps.length - 1 ? "Post Job" : "Next"}
          {currentStep < steps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
